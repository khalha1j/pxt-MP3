/**
* pinkyo JQ6500 mp3 player
*/


//% weight=0 color=#b9a0e6 icon="\uf001" block="MP3 Player-HHH1"
namespace pinkyo {
    serial.onDataReceived("E", () => {
    })
    let Start_Byte = 0x7E
    let Version_Byte = 0xFF
    let Command_Length = 0x06
    let CMD_Bytes_Count = 0x02
    let End_Byte = 0xEF
    let Acknowledge = 0x00
    let CMD=0x00
    let para1=0x00
    let para2=0x00
    let highByte=0x00
    let lowByte=0x00
    let dataArr: number[] = [Start_Byte, CMD_Bytes_Count, CMD, highByte, lowByte, End_Byte]
    //let dataArr: number[] = [Start_Byte, Version_Byte, Command_Length, CMD, Acknowledge, para1, para2, highByte, lowByte, End_Byte]

    
    export enum playType {
        //% block="Play"
        type1 = 0x0D,
        //% block="Pause"
        type2 = 0x0E,
        //% block="PlayNext"
        type3 = 0x01,
        //% block="PlayPrevious"
        type4 = 0x02,
        //% block="Pause"
        type5 = 0x0E
    }
    
        export enum queryType {
        //% block="Status"
        type1 = 0x42,
        //% block="Volume"
        type2 = 0x43,
        //% block="EQ"
        type3 = 0x44,
        //% block="PlayMode"
        type4 = 0x45,
        //% block="SoftwareVersion"
        type5 = 0x46,
        //% block="TotalFlashFiles"
        type4 = 0x49,
        //% block="currentFlashTrack"
        type5 = 0x4D,
        //% block="currentPlayTime"
        type5 = 0x50,
        //% block="totalPlayTimeCurrentTrack"
        type5 = 0x51,
        //% block="nameOfPlayingFile"
        type5 = 0x52        
    }

    export enum yesOrNot {
        //% block="no"
        type1 = 0,
        //% block="yes"
        type2 = 1
    }

    //% blockId="MP3_setSerial" block="set DFPlayer mini RX to %pinRX|TX to %pinTX"
    //% weight=100 blockGap=20
    export function MP3_setSerial(pinRX: SerialPin, pinTX: SerialPin): void {
        serial.redirect(
            pinRX,
            pinTX,
            BaudRate.BaudRate9600
        )
        basic.pause(100)
    }

    function checkSum():void {
        let total=0;
        for(let i=1;i<7;i++){
            total+=dataArr[i]
        }
        total=65536 - total
        lowByte = total & 0xFF;
        highByte = total >> 8;
        dataArr[7]=highByte
        dataArr[8]=lowByte
    }

//% blockId="getInfo" block="get info:%myQuery"
//% weight=90 blockExternalInputs=true blockGap=20
export function getInfo(myQuery: queryType):void{
    //length of dataArr for this function is always 4 bytes ==> Get Volume:【7E 02 43 EF】

        Start_Byte = 0x7E
        CMD_Bytes_Count = 0x02
        CMD=myQuery
        End_Byte = 0xEF
        dataArr[0]=Start_Byte
        dataArr[1]=CMD_Bytes_Count
        dataArr[2]=CMD
        dataArr[3]=End_Byte
        sendData()
    }
    
    
    
    
//% blockId="execute" block="execute procedure:%myType"
//% weight=90 blockExternalInputs=true blockGap=20
export function execute(myType: playType):void{
    //length of dataArr for this function is always 4 bytes ==> [0x7E, 0x02, playType, 0xEF]
        Start_Byte = 0x7E
        CMD_Bytes_Count = 0x02
        CMD=myType
        End_Byte = 0xEF
        dataArr[0]=Start_Byte
        dataArr[1]=CMD_Bytes_Count
        dataArr[2]=CMD
        dataArr[3]=End_Byte
        sendData()
    }
    
    //% blockId="setTracking" block="play the mp3 on the track:%tracking|repeat:%myAns"
    //% weight=85 blockGap=20 tracking.min=1 tracking.max=255
    export function setTracking(tracking:number,myAns:yesOrNot):void{
        //    let dataArr: number[] = [Start_Byte, CMD_Bytes_Count, CMD, highByte, lowByte, End_Byte]
        
        //set loop:【7E 03 11 01 EF】 --> play file:【7E 04 03 00 02 EF】
        
        if (myAns==1){//first set loop mode to single song 【7E 04 03 00 02 EF】
            CMD_Bytes_Count = 0x03
            CMD             = 0x11
            highByte        = 0x02 //set loop mode to single song loop
            lowByte         = 0xEF 
            dataArr[1] = CMD_Bytes_Count
            dataArr[2] = CMD
            dataArr[3] = highByte
            dataArr[4] = lowByte
            //checkSum()
            sendData()
                            basic.pause(100)


        }else{//first set loop mode to single play then stop 【7E 04 03 00 04 EF】
            CMD_Bytes_Count = 0x03
            CMD             = 0x11
            highByte        = 0x04 //set loop mode to single play then stop
            lowByte         = 0xEF
            dataArr[1] = CMD_Bytes_Count
            dataArr[2] = CMD
            dataArr[3] = highByte
            dataArr[4] = lowByte
            //checkSum()
            sendData()
                            basic.pause(100)

        }
        //【7E 04 03 00 02 EF】   

        CMD_Bytes_Count = 0x04
        CMD             = 0x03
        highByte        = 0x00
        lowByte         = tracking
        dataArr[1]      = CMD_Bytes_Count
        dataArr[2]      = CMD
        dataArr[3]      = highByte
        dataArr[4]      = lowByte
        dataArr[5]      = 0xEF
        //checkSum()
        sendData()
                basic.pause(100)

        execute(0x0D)
        
    }


    //% blockId="setVolume" block="set volume(0~30):%volume"
    //% weight=70 blockGap=20 volume.min=0 volume.max=30
    export function setVolume(volume:number):void{
        //volume 0-30【7E 03 06 15 EF】
            CMD_Bytes_Count = 0x03
            CMD             = 0x06
            highByte        = volume //set volume 0-30
            lowByte         = 0xEF
            dataArr[1] = CMD_Bytes_Count
            dataArr[2] = CMD
            dataArr[3] = highByte
            dataArr[4] = lowByte
            //checkSum()
            sendData()
    }

    function sendData():void{
        let myBuff = pins.createBuffer(6);
        for(let i=0;i<6;i++){
            myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i])           
        }
        serial.writeBuffer(myBuff)
        basic.pause(100)
    }

} 

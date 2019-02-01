/**
* DFPlayer mini的函數
*/


//% weight=0 color=#b9a0e6 icon="\uf001" block="MP3 Player-HAK2"
namespace dfplayer {
    serial.onDataReceived("E", () => {
    })
    let Start_Byte = 0x7E
    let Version_Byte = 0xFF
    let Bytes_Follow_Count = 0x06
    let End_Byte = 0xEF
    let Acknowledge = 0x00
    let CMD=0x00
    let paraHighByte=0x00
    let paraLowByte=0x00
    //let dataArr: number[] = [0x7E, 0x02, CMD, 0xEF]
    let dataArr: number[] = [Start_Byte, Bytes_Follow_Count, CMD, paraHighByte, paraLowByte, End_Byte]

    
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
        paraLowByte = total & 0xFF;
        paraHighByte = total >> 8;
        dataArr[7]=paraHighByte
        dataArr[8]=paraLowByte
    }
    //% blockId="execute" block="execute procedure:%myType"
    //% weight=90 blockExternalInputs=true blockGap=20
    /*
    export function execute(myType: playType):void{
        CMD=myType
        para1=0x00
        para2=0x00
        dataArr[3]=CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }
    */
export function execute(myType: playType):void{
    //length of dataArr for this function is always 4 bytes ==> [0x7E, 0x02, playType, 0xEF]
    //dataArr: number[] = [Start_Byte, Bytes_Follow_Count, CMD, paraHighByte, paraLowByte, End_Byte]

        Bytes_Follow_Count = 0x02
        CMD=myType
        paraHighByte = 0xEF
        paraLowByte = 0xEF
        End_Byte = 0xEF
    
        dataArr[1]=Bytes_Follow_Count
        dataArr[2]=CMD
        dataArr[3]=End_Byte
        dataArr[4]=End_Byte
        sendData()
    }
    
    //% blockId="setTracking" block="play the mp3 on the track:%tracking|repeat:%myAns"
    //% weight=85 blockGap=20 tracking.min=1 tracking.max=255
    export function setTracking(tracking:number,myAns:yesOrNot):void{
        CMD=0x03
        para1=0x00
        para2=tracking
        dataArr[3]=CMD
        dataArr[5] = para1
        dataArr[6] = para2
        //checkSum()
        sendData()
        execute(0x0D)
        /*if (myAns==1)
           execute(0x19)
           */
    }


    //% blockId="folderPlay" block="play the mp3 in the folder:%folderNum|filename:%fileNum|repeat:%myAns"
    //% weight=80 blockGap=20 folderNum.min=1 folderNum.max=99 fileNum.min=1 fileNum.max=255
    export function folderPlay(folderNum:number, fileNum:number,myAns:yesOrNot):void{
        CMD=0x0F
        para1=folderNum
        para2=fileNum
        dataArr[3]=CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
        if (myAns==1)
           execute(0x19)
    }

    //% blockId="setLoop" block="loop play all the MP3s in the SD card"
    //% weight=75 blockGap=20 
    export function setLoop():void{
        CMD=0x11
        para1=0
        para2=0x01
        dataArr[3]=CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }

    //% blockId="setLoopFolder" block="loop play all the MP3s in the folder:%folderNum"
    //% weight=73 blockGap=20 folderNum.min=1 folderNum.max=99
    export function setLoopFolder(folderNum:number):void{
        CMD=0x17
        para1=0
        para2=folderNum
        dataArr[3]=CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }


    //% blockId="setVolume" block="set volume(0~48):%volume"
    //% weight=70 blockGap=20 volume.min=0 volume.max=48
    export function setVolume(volume:number):void{
        CMD=0x06
        para1=0
        para2=volume
        dataArr[3]=CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
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

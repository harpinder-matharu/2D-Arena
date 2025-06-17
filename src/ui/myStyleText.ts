import { FillInput, Text,TextStyle } from "pixi.js";

export default class MyStyleText {

    static styleGlobal:TextStyle = new TextStyle({
        fontSize: 90,
        fill: "#7238a3",
        fontFamily: "Verdana",
        align: "center",
    });

    static styleGlobalSmall:TextStyle = new TextStyle({
        fontFamily: "Comic Sans MS",
        fontSize: 70,
        fill: "#7238a3",
        lineHeight: 100,
        align: "center",
    });
    
    static creatText(text:string,size:number = 50,color:FillInput = "#000000",fontFamily:string = "Comic Sans MS") : Text{
        const textGrapic = new Text({
            text: text,
            style: {
                fontFamily: fontFamily,
                fontSize: size,
                fill: color,
                lineHeight: size*1.1,
                align: "center",
            },
        });
        textGrapic.anchor.set(0.5, 0.5);
        textGrapic.interactive = false;
        textGrapic.eventMode = 'none';
        return textGrapic;
    }
}
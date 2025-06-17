import { ColorSource, FillInput, Graphics, Text } from "pixi.js";
import MyStyleText from "./myStyleText";
import { DropShadowFilter } from "pixi-filters";
import Sounds from "../sounds";

export class Button extends Graphics {
    buttonText: Text;
    constructor(text: string, buttonColor: ColorSource = 0xa3a8e9, textColor: FillInput = 0xffffff, widht: number = 400, height: number = 150, textsize: number = 60) {
        super();
        // Button
        this.roundRect(-widht/2, -height/2, widht, height, 16);
        this.fill(buttonColor);
        this.stroke({
            color: 0xffffff,
            width: 5,
            alignment: 0,
        });
        this.filters = [new DropShadowFilter({
            color: buttonColor,
            alpha: 0.4,
            blur: 0,
            offset: { x: 3, y: 3 }
        })];

        this.buttonText = MyStyleText.creatText(text, textsize, textColor);
        this.addChild(this.buttonText);

        this.eventMode = "static";
        this.cursor = "pointer";
    }

    onClick(handler: () => void) {
        this.on("pointertap", handler);
    }
}
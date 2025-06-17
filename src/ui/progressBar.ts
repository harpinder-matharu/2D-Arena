import { Graphics, Container } from "pixi.js";
import { Power1 } from "gsap";

export default class ProgressBar {

    container:Container;
    background: Graphics;
    bar: Graphics;

    width: number;
    height: number;
    barColor:number;
    round:number;

    constructor(width: number, height: number, round: number = 2, backgroundColor = 0x444444, barColor = 0x00ff00) {
        this.container = new Container();
        this.container.pivot.set(0.5);
        this.container.interactiveChildren = false;

        this.width = width;
        this.height = height;
        this.barColor = barColor;
        this.round = round;

        // Background
        this.background = new Graphics();
        this.background.roundRect(-width/2, 0, width, height, round);
        this.background.fill(backgroundColor);
        this.background.stroke({
            color: 0x555555,
            width: 5,
            alignment: 0,
        });
        this.container.addChild(this.background);

        // Progress bar
        this.bar = new Graphics();

        this.container.addChild(this.bar);
    }

    /**
     * Set progress (0 to 1)
     */
    public setProgress(value: number) {
        value = Power1.easeOut(value);
        this.bar.clear();
        const width = this.width*value;
        this.bar.roundRect(-this.width/2, 0, width, this.height, this.round);
        this.bar.fill(this.barColor);
    }
}

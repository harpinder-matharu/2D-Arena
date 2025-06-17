import { Container, Graphics, Text, Sprite, Texture, FillInput, ColorSource } from "pixi.js";
import MyStyleText from "./myStyleText";
import { DropShadowFilter } from "pixi-filters";
import gsap from "gsap";
import { Button } from "./button";

export class Panel extends Container {
    protected panelWidht;
    protected panelHeight;

    private panelBox: Graphics;
    private titleText: Text;
    private msgText: Text;
    private iconSprite: Sprite;

    button1: Button;
    button2: Button;

    constructor(widht:number, height:number,panelColor: FillInput) {
        super();
        this.panelWidht = widht;
        this.panelHeight = height;

        this.pivot.set(0.5,100);
        // Panel Box
        this.panelBox = new Graphics();
        this.panelBox.roundRect(-this.panelWidht/2, -this.panelHeight/2, this.panelWidht, this.panelHeight, 16);
        this.panelBox.fill(panelColor);
        this.panelBox.stroke({
            color: 0x999999,
            width: 5,
            alignment: 0,
        });
        this.panelBox.filters = [new DropShadowFilter({
        })];
        this.addChild(this.panelBox);

        this.visible = false;
        this.interactiveChildren = false;
    }

    addTitle(title: string, titleColor: FillInput = "#000000", sizeFont:number =  140){
        if(this.titleText)
            this.titleText .destroy();
        this.titleText = MyStyleText.creatText(title, sizeFont ,titleColor);
        this.titleText.x = 0;
        this.titleText.y = -this.panelHeight/2 + sizeFont/2;
        this.addChild(this.titleText);
    }

    addMsg(msg: string, titleColor: FillInput = "#833131", sizeFont:number =  50){
        if(this.msgText)
            this.msgText .destroy();
        this.msgText = MyStyleText.creatText(msg, sizeFont ,titleColor);
        this.msgText.x = 0;
        this.msgText.y = this.panelHeight/4 ;
        this.addChild(this.msgText);
    }

    addButton1(buttonText: string,buttonColor: ColorSource){
        if(this.button1)
            this.button1.destroy();
        this.button1 = new Button(buttonText,buttonColor);
        this.button1.x = 0;
        this.button1.y = this.panelHeight/2 - this.button1.height/2 - 20;

        this.addChild(this.button1);
    }

    addButton2(buttonText: string,buttonColor: ColorSource){
        if(this.button2)
            this.button2.destroy();
        if(!this.button1)
        {
            throw console.error("you need to add button1 ferst");
            return;
        }
        this.button2 = new Button(buttonText,buttonColor);

        this.button1.x = -this.panelWidht/4;
        this.button2.x = this.panelWidht/4;
        this.button2.y = this.button1.y;

        this.addChild(this.button2);
    }

    addIconSprite(iconTexture?: Texture){
        if(this.iconSprite)
            this.iconSprite.destroy();
        this.iconSprite = new Sprite(iconTexture);
        this.iconSprite.anchor.set(0.5);
        this.iconSprite.width = this.panelHeight * 0.6;
        this.iconSprite.scale.y = this.iconSprite.scale.x;
        this.iconSprite.position.y = this.panelHeight / 2 - this.iconSprite.width;
        this.addChild(this.iconSprite);
    }

    openPanel(){
        if(!this.visible){
            this.interactiveChildren = true;
            this.visible = true;
            this.pivot.y = -800;

            gsap.to(this.pivot, {
                y: 100,
                ease: "back.out",
                duration: 0.35,
                onComplete : ()=>{
                    if(this.iconSprite){
                        this.iconSprite.rotation = -0.3;        
                        gsap.to(this.iconSprite, {
                            rotation: 0.3,
                            duration: 0.35,
                            ease: "sine.inOut",
                            delay: 0.1,
                            repeat: 10,
                            yoyo:true
                        });
                     }   
                }
            });
        }
    }

    closePanel(){
        if(this.visible){
            this.interactiveChildren = false;
            gsap.to(this.pivot, {
                y: -800,
                ease: "sine.in",
                duration: 0.35,
                onComplete : ()=>{
                    this.iconSprite.rotation = -0.3;        
                    this.visible = false;
                }
            });
        }
    }
}

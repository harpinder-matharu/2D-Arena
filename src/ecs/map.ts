import {Container, Graphics, PointData, Sprite, Texture, Assets } from "pixi.js";
import {Bound} from './base/world'

export interface SpriteData {
    name: string;
    position: PointData;
    zIndex: number
}

export interface ColliderData {
    x: number;
    y: number;
    z: number;  // width
    w: number;  // height
}

export interface MapDataList {
    sprites: SpriteData[];
    colliders: ColliderData[];
}

export default class Map extends Container{

    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    map:number;

    bgSprite:Sprite;

    constructor(parent:Container, map:number){
        super();
        this.interactive = false;
        this.interactiveChildren = false;
        this.scale = 0.3;
        this.map = map;
        parent.addChild(this);
    }

    async init() : Promise<MapDataList>{
        // Load the map data
        const mapData: MapDataList = await this.loadMap(this.map);

        // Load background
        const texture = await Assets.load('./images/BG.jpg');
        this.bgSprite = Sprite.from(texture);
        this.bgSprite.scale = 5;
        // this.bgSprite.zIndex = -5;
        this.addChild(this.bgSprite);

        this.minY = this.minX = 999999;
        this.maxY = this.maxX = -999999;

        // Load and create sprites
        for (const sprite of mapData.sprites) {
            // Load the image file directly
            console.log(sprite.name);
            const texture = await Assets.load(`./images/${sprite.name}.png`);
            const spriteImage = new Sprite(texture);
            
            spriteImage.anchor = 0.5;
            spriteImage.position.x = sprite.position.x * 100;
            spriteImage.position.y = -sprite.position.y * 100;
            spriteImage.zIndex = sprite.zIndex;
            this.addChild(spriteImage);

            this.minX = Math.min(this.minX, spriteImage.position.x - spriteImage.width / 2);
            this.maxX = Math.max(this.maxX, spriteImage.position.x + spriteImage.width / 2);

            this.minY = Math.min(this.minY, spriteImage.position.y - spriteImage.height / 2);
            this.maxY = Math.max(this.maxY, spriteImage.position.y + spriteImage.height / 2);
        }

        this.maxY += 200;
        this.minY -= 100;

        this.addBorderWord();

        return mapData;
    }

    async loadMap(index: number): Promise<MapDataList> {
        const url = `./maps/map${index}.json`;
        const retries = 3;
        const delay = 300; // 3 seconds

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                } else {
                    const points: MapDataList = await response.json();
                    return points;
                }
            } catch (error: any) {
                console.warn(`Attempt ${attempt} to load level ${index} failed: ${error.message}`);

                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`All ${retries} attempts failed to load level ${index}`);
                    throw new Error(`Could not load level ${index}: ${error.message}`);
                }
            }
        }

        throw new Error(`Unexpected error in loadLevel`);
    }

    addBorderWord(){
        const border:Graphics = new Graphics();
        const w = this.maxX - this.minX;
        const h = this.maxY - this.minY;
        border.roundRect(this.minX,this.minY,w,h, 10);

        this.bgSprite.width = w;
        this.bgSprite.height = h;
        this.bgSprite.position.set(this.minX,this.minY);
        border.stroke({
            width : 5,
            color: 0x000000,
            alignment: 0.5,
        });

        const bottom:Graphics = new Graphics();
        bottom.roundRect(this.minX,this.maxY-280,w,280, 10);
        bottom.fill(0x4FC7E7);
        bottom.zIndex = -1;
        this.addChild(border,bottom);
    }

    getBound():Bound{
        const scale = this.scale.x;
        return {
            minX : this.minX*scale,
            minY : this.minY*scale,
            maxX : this.maxX*scale,
            maxY : this.maxY*scale,
        }
    }
}
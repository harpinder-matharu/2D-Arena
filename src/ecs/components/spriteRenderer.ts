import * as PIXI from 'pixi.js';
import { Component } from '../base/component';

export interface SpriteRendererOptions {
    anchor?: number;
    scale?: number;
    offsetX?: number;
    offsetY?: number;
}

export class SpriteRenderer extends Component {
    sprite: PIXI.Sprite;
    offsetX: number = 0;
    offsetY: number = 0;

    constructor(entityId: number, texture: PIXI.Texture | null, public options?: SpriteRendererOptions) {
        super(entityId);
        if (texture != null) {
            this.sprite = new PIXI.Sprite(texture);
            if (options?.anchor !== undefined) 
                this.sprite.anchor.set(options.anchor);
            
            if (options?.scale !== undefined) 
                this.sprite.scale.set(options.scale);
            
        }
        if (options?.offsetX !== undefined) 
            this.offsetX = options.offsetX;
        if (options?.offsetY !== undefined) 
            this.offsetY = options.offsetY;
    }
}
import { AnimatedSprite, Assets, Texture } from 'pixi.js';
import { SpriteRenderer, SpriteRendererOptions } from './spriteRenderer';

export class SpritesAnimationRenderer extends SpriteRenderer {
    spriteAnimation: AnimatedSprite;

    constructor(entityId: number, textures: Texture[], public options?: SpriteRendererOptions) {
        super(entityId, null, options);
        // Animated Sprite
        this.spriteAnimation = new AnimatedSprite(textures);
        this.spriteAnimation.animationSpeed = 0.1; // default
        this.spriteAnimation.play();
        this.sprite = this.spriteAnimation;
        
        if (options?.anchor !== undefined) {
            this.spriteAnimation.anchor.set(options.anchor);
        }
        if (options?.scale !== undefined) {
            this.spriteAnimation.scale.set(options.scale);
        }
        if (options?.offsetX !== undefined) {
            this.spriteAnimation.position.x = options.offsetX;
        }
        if (options?.offsetY !== undefined) {
            this.spriteAnimation.position.y = options.offsetY;
        }
    }

    setAnimation(textures: Texture[]): void {
        this.spriteAnimation.textures = textures;
        this.spriteAnimation.play();
    }

    setAnimationSpeed(speed: number): void {
        this.spriteAnimation.animationSpeed = speed;
    }

    play(): void {
        this.spriteAnimation.play();
    }

    stop(): void {
        this.spriteAnimation.stop();
    }
}
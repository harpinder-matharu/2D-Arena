import { Component } from '../base/component';
import { SpritesAnimationRenderer } from './spritesAnimationRenderer';
import { Assets, Texture } from 'pixi.js';

export enum CharacterState {
    IDLE = 'Idle',
    RUN = 'Run',
    JUMP = 'Jump',
    SHOOT = 'Shoot',
    DEAD = 'Dead'
}

export class CharacterAnimator extends Component {
    private currentState: CharacterState = CharacterState.IDLE;
    private spriteRenderer: SpritesAnimationRenderer;
    private characterType: string;
    private animationFrames: Map<CharacterState, Texture[]> = new Map();
    private isInitialized: boolean = false;

    constructor(entityId: number, characterType: string) {
        super(entityId);
        this.characterType = characterType; // 'Player' or 'Enemy'
    }

    async loadAnimationFrames() {
        for (const state of Object.values(CharacterState)) {
            const frames: Texture[] = [];
            let frameCount = 1;
            
            while (true) {
                try {
                    const texture = await Assets.load(`./characters/${this.characterType}/${state}/${state}${frameCount}.png`);
                    frames.push(texture);
                    frameCount++;
                } catch (error) {
                    break;
                }
            }
            
            if (frames.length > 0) {
                this.animationFrames.set(state, frames);
            }
        }
        this.isInitialized = true;
    }

    async init(spriteRenderer: SpritesAnimationRenderer) {
        this.spriteRenderer = spriteRenderer;
        await this.loadAnimationFrames();
    }

    setState(state: CharacterState) {
        if (!this.isInitialized) return;
        
        // Don't change state if already dead, unless setting to DEAD state again
        if (this.currentState === CharacterState.DEAD && state !== CharacterState.DEAD) {
            return;
        }
        
        // Don't change if trying to set the same state
        if (this.currentState === state) return;
        
        const frames = this.animationFrames.get(state);
        if (frames) {
            this.currentState = state;
            this.spriteRenderer.setAnimation(frames);
            
            // Adjust animation speed based on state
            switch (state) {
                case CharacterState.RUN:
                    this.spriteRenderer.setAnimationSpeed(0.2);
                    break;
                case CharacterState.JUMP:
                    this.spriteRenderer.setAnimationSpeed(0.15);
                    break;
                case CharacterState.SHOOT:
                    this.spriteRenderer.setAnimationSpeed(0.25);
                    break;
                case CharacterState.DEAD:
                    this.spriteRenderer.setAnimationSpeed(0.1);
                    break;
                default:
                    this.spriteRenderer.setAnimationSpeed(0.1);
            }
            
            this.spriteRenderer.play();
        }
    }

    getCurrentState(): CharacterState {
        return this.currentState;
    }
} 
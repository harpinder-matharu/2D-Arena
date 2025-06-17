import { Entity } from '../base/entity';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Health } from '../components/health';
import { Lifetime } from '../components/lifetime';
import { SpriteRenderer } from '../components/spriteRenderer';
import { Texture, Assets } from 'pixi.js';
import { Collider } from '../components/collider';
import { Trigger } from '../components/trigger';
import { Bullet } from '../components/bullet';
import { Team } from '../components/team';

export class BulletEntity extends Entity {
    constructor(x: number, y: number, vx: number, vy: number, shooter: Entity) {
        super();
        
        // Get shooter's team
        const shooterTeam = shooter.getComponent(Team);
        if (!shooterTeam) return;

        this.addComponent(new Position(this.id, x, y));
        this.addComponent(new Velocity(this.id, vx, vy, false, false)); // Don't bounce or use gravity
        this.addComponent(new Team(this.id, shooterTeam.teamId));
        this.addComponent(new Lifetime(this.id, 2)); // 2 seconds lifetime
        this.addComponent(new Bullet(this.id, 20)); // 20 damage per bullet
        
        // Add bullet sprite
        const texture = Assets.get<Texture>("bullet");
        if (texture) {
            const renderSprite = new SpriteRenderer(this.id, texture, { 
                scale: 0.5,
                anchor: 0.5 // Set anchor through options instead
            });
            if (renderSprite.sprite) {
                // Calculate rotation angle from velocity
                renderSprite.sprite.rotation = Math.atan2(vy, vx);
            }
            this.addComponent(renderSprite);
        } else {
            console.warn("Bullet texture not found!");
        }
        
        // Add trigger collider for bullet
        this.addComponent(new Trigger(this.id, 8, 8, 0, 0));
    }
}
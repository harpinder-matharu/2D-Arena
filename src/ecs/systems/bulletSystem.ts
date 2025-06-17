import { System } from '../base/system';
import { World } from '../base/world';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Lifetime } from '../components/lifetime';
import { Entity } from '../base/entity';
import MainGame from '../../mainGame';
import { Team } from '../components/team';
import { Collider } from '../components/collider';
import { Health } from '../components/health';

export class BulletSystem extends System {
    private readonly SCREEN_MARGIN = 100; // Extra margin beyond screen bounds

    constructor(private world: World) {
        super();
        this.requiredComponents = [Position, Lifetime];
    }

    update(delta: number, entities: Entity[]): void {
        for (const entity of entities) {
            const lifetime = entity.getComponent(Lifetime);
            const pos = entity.getComponent(Position);
            const team = entity.getComponent(Team);

            if (!lifetime || !pos || !team) continue;

            // Update lifetime
            lifetime.duration -= delta;
            if (lifetime.duration <= 0) {
                this.world.removeEntity(entity.id);
                continue;
            }

            // Get the visible world bounds
            const screenWidth = MainGame.instance.screenWidth;
            const screenHeight = MainGame.instance.screenHeight;
            const cameraX = MainGame.instance.screenCenterX;
            const cameraY = MainGame.instance.screenCenterY;

            // Convert screen bounds to world coordinates
            const worldLeft = -screenWidth;
            const worldRight = screenWidth;
            const worldTop = -screenHeight;
            const worldBottom = screenHeight;

            // Check if bullet is out of world bounds (with margin)
            if (pos.x < worldLeft - this.SCREEN_MARGIN ||
                pos.x > worldRight + this.SCREEN_MARGIN ||
                pos.y < worldTop - this.SCREEN_MARGIN ||
                pos.y > worldBottom + this.SCREEN_MARGIN) {
                this.world.removeEntity(entity.id);
                continue;
            }

            // Check for collisions with other entities
            for (const otherEntity of entities) {
                if (otherEntity.id === entity.id) continue;

                const otherTeam = otherEntity.getComponent(Team);
                const otherHealth = otherEntity.getComponent(Health);
                const otherCollider = otherEntity.getComponent(Collider);
                const otherPos = otherEntity.getComponent(Position);

                // Skip if missing required components or same team
                if (!otherTeam || !otherHealth || !otherCollider || !otherPos || otherTeam.teamId === team.teamId) continue;

                // Simple box collision check
                const bulletSize = 8; // Size of bullet collision box
                const bulletLeft = pos.x - bulletSize/2;
                const bulletRight = pos.x + bulletSize/2;
                const bulletTop = pos.y - bulletSize/2;
                const bulletBottom = pos.y + bulletSize/2;

                const otherLeft = otherPos.x + otherCollider.offsetX;
                const otherRight = otherLeft + otherCollider.width;
                const otherTop = otherPos.y + otherCollider.offsetY;
                const otherBottom = otherTop + otherCollider.height;

                if (bulletRight > otherLeft && bulletLeft < otherRight &&
                    bulletBottom > otherTop && bulletTop < otherBottom) {
                    // Collision detected, destroy bullet
                    this.world.removeEntity(entity.id);
                    break;
                }
            }
        }
    }
}

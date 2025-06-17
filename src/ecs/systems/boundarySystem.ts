import { System } from '../base/system';
import { World } from '../base/world';
import { Position } from '../components/position';
import { Entity } from '../base/entity';
import MainGame from '../../mainGame';
import { CharacterAnimator, CharacterState } from '../components/characterAnimator';
import { Velocity } from '../components/velocity';

export class BoundarySystem extends System {
    private readonly BOTTOM_MARGIN = 200; // Extra margin below screen before destroying

    constructor(private world: World) {
        super();
        this.requiredComponents = [Position];
    }

    update(delta: number, entities: Entity[]): void {
        const screenHeight = MainGame.instance.screenHeight;
        const worldBottom = screenHeight;

        for (const entity of entities) {
            const pos = entity.getComponent(Position);
            if (!pos) continue;

            // Only check for falling off the bottom of the screen
            if (pos.y > worldBottom + this.BOTTOM_MARGIN) {
                const animator = entity.getComponent(CharacterAnimator);
                if (animator) {
                    // Play death animation
                    animator.setState(CharacterState.DEAD);
                    // Stop movement
                    const velocity = entity.getComponent(Velocity);
                    if (velocity) {
                        velocity.x = 0;
                        velocity.y = 0;
                        velocity.affectedByGravity = false;
                    }
                    // Remove entity after animation
                    setTimeout(() => {
                        this.world.removeEntity(entity.id);
                    }, 1000); // 1 second for death animation
                } else {
                    // If no animator, remove immediately
                    this.world.removeEntity(entity.id);
                }
            }
        }
    }
} 
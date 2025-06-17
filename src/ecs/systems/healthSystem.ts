import { System } from '../base/system';
import { World } from '../base/world';
import { Health } from '../components/health';
import { Entity } from '../base/entity';
import { CharacterAnimator, CharacterState } from '../components/characterAnimator';

export class HealthSystem extends System {
    private readonly HURT_ANIMATION_DURATION = 0.3; // Duration of hurt animation in seconds
    private hurtAnimationTimers: Map<number, number> = new Map();

    constructor(private world: World) {
        super();
        this.requiredComponents = [Health];
    }

    update(delta: number, entities: Entity[]): void {
        // Update hurt animation timers
        for (const [entityId, timer] of this.hurtAnimationTimers.entries()) {
            if (timer > 0) {
                const newTimer = timer - delta;
                this.hurtAnimationTimers.set(entityId, newTimer);
                
                // If animation finished, return to previous state
                if (newTimer <= 0) {
                    const entity = entities.find(e => e.id === entityId);
                    if (entity) {
                        const animator = entity.getComponent(CharacterAnimator);
                        if (animator) {
                            animator.setState(CharacterState.IDLE);
                        }
                    }
                }
            }
        }

        for (const entity of entities) {
            const health = entity.getComponent(Health);
            if (!health) continue;

            // Check if entity took damage this frame
            if (health.lastDamageTaken > 0) {
                // Play hurt animation
                const animator = entity.getComponent(CharacterAnimator);
                if (animator) {
                    animator.setState(CharacterState.DEAD);
                    this.hurtAnimationTimers.set(entity.id, this.HURT_ANIMATION_DURATION);
                }

                // Reset damage taken
                health.lastDamageTaken = 0;
            }

            // Remove dead entities
            if (health.current <= 0) {
                this.world.removeEntity(entity.id);
            }
        }
    }
} 
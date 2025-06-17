// systems/playerControlSystem.ts
import { System } from "../base/system";
import { World } from "../base/world";
import { Velocity } from "../components/velocity";
import { PlayerControlled } from "../components/playerControlled";
import { Collider } from "../components/collider";
import { SpritesAnimationRenderer } from "../components/spritesAnimationRenderer";
import { Entity } from "../base/entity";
import { Gun } from "../components/gun";
import { CharacterAnimator, CharacterState } from "../components/characterAnimator";

const keys: Record<string, boolean> = {};

window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

export class PlayerControlSystem extends System {
    public static MOVE_SPEED = 200;
    public static JUMP_FORCE = 650;
    public static GRAVITY = 800;

    constructor(private world: World) {
        super();
        this.requiredComponents = [PlayerControlled, Velocity];
    }

    update(delta: number, entities: Entity[]): void {
        for (const entity of entities) {
            const velocity = entity.getComponent(Velocity);
            const animator = entity.getComponent(CharacterAnimator);
            const collider = entity.getComponent(Collider);
            
            if (!velocity) continue;

            // Check if we're actually on ground by looking at collision state
            if (velocity.onGround && collider && !collider.isOnCollide) {
                velocity.onGround = false;
                velocity.affectedByGravity = true;
                if (animator) {
                    animator.setState(CharacterState.JUMP);
                }
            }

            // Reset horizontal velocity
            velocity.x = 0;

            // Handle horizontal movement
            if (keys["KeyA"] || keys["ArrowLeft"]) {
                velocity.x = -PlayerControlSystem.MOVE_SPEED;
                this.flipDirection(entity, true);
                if (animator && velocity.onGround) {
                    animator.setState(CharacterState.RUN);
                }
            } else if (keys["KeyD"] || keys["ArrowRight"]) {
                velocity.x = PlayerControlSystem.MOVE_SPEED;
                this.flipDirection(entity, false);
                if (animator && velocity.onGround) {
                    animator.setState(CharacterState.RUN);
                }
            } else if (animator && velocity.onGround) {
                animator.setState(CharacterState.IDLE);
            }

            // Handle jumping
            if ((keys["Space"] || keys["KeyW"] || keys["ArrowUp"]) && velocity.onGround) {
                velocity.y = -PlayerControlSystem.JUMP_FORCE;
                velocity.onGround = false;
                velocity.affectedByGravity = true;
                if (animator) {
                    animator.setState(CharacterState.JUMP);
                }
            }

            // Apply gravity if not on ground
            if (!velocity.onGround && velocity.affectedByGravity) {
                velocity.y += PlayerControlSystem.GRAVITY * delta;
            }

            // Update animation based on vertical movement
            if (animator && !velocity.onGround) {
                // Only update jump animation if we're not already in jump state
                if (animator.getCurrentState() !== CharacterState.JUMP) {
                    animator.setState(CharacterState.JUMP);
                }
            }
        }
    }

    private flipDirection(entity: Entity, left: boolean): void {
        const spriteAnimation = entity.getComponent(SpritesAnimationRenderer);
        const gun = entity.getComponent(Gun);
        if (spriteAnimation) {
            const sprite = spriteAnimation.sprite;
            if (left) {
                if (gun) gun.offsetX = -Math.abs(gun.offsetX);
                sprite.scale.x = Math.abs(spriteAnimation.sprite.scale.x) * -1;
                sprite.position.x = 30;
            } else {
                if (gun) gun.offsetX = Math.abs(gun.offsetX);
                sprite.scale.x = Math.abs(spriteAnimation.sprite.scale.x) * 1;
                sprite.position.x = 0;
            }
        }
    }
}

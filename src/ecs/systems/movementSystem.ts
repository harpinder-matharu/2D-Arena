import { System } from '../base/system';
import { World } from '../base/world';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Entity } from '../base/entity';

export class MovementSystem extends System {

    readonly gravity: number = 1500; // Increased for more responsive feel

    constructor(private world: World) {
        super(10); // High priority for movement
        this.requiredComponents = [Position, Velocity];
    }

    update(delta: number, entities: Entity[]): void {
        for (const entity of entities) {
            const pos = entity.getComponent(Position);
            const vel = entity.getComponent(Velocity);

            if (pos && vel) {
                pos.x += vel.x * delta;
                pos.y += vel.y * delta;

                // Optional gravity
                if (vel.gravity) {
                    vel.y += this.gravity * delta;
                }

                if(vel.bounce){
                    const bound = this.world.bound;
                    if (pos.y < bound.minY) {
                        pos.y = bound.minY;
                        vel.y = Math.abs(vel.y);
                    }
                    // Bounce off bottom
                    if (pos.y > bound.maxY) {
                        pos.y = bound.maxY;
                        vel.y = -1 * Math.abs(vel.y);
                    }
                
                    // Bounce off sides
                    if (pos.x < bound.minX) {
                        pos.x = bound.minX;
                        vel.x = Math.abs(vel.x);
                    }

                    // Bounce off sides
                    if (pos.x > bound.maxX) {
                        pos.x = bound.maxX;
                        vel.x = -1 * Math.abs(vel.x);
                    }
                }
            }
        }
    }
}

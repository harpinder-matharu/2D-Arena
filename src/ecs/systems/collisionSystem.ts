import { System } from '../base/system';
import { World } from '../base/world';
import { Entity } from '../base/entity';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Collider } from '../components/collider';
import { Health, DamageType } from '../components/health';
import { Bullet } from '../components/bullet';
import { Trigger } from '../components/trigger';
import { Team } from '../components/team';
import { PlayerControlled } from '../components/playerControlled';
import { CharacterAnimator, CharacterState } from '../components/characterAnimator';

export class CollisionSystem extends System {
    constructor(private world: World) {
        super(20); // Medium priority
    }

    update(delta: number, entities: Entity[]): void {
        // Handle regular collisions first
        this.handleRegularCollisions(entities);
        
        // Then handle bullet collisions
        this.handleBulletCollisions(entities);
    }

    private handleRegularCollisions(entities: Entity[]): void {
        // Get all entities that have Collider and Velocity
        const colliders = entities.filter(
            e => e.getComponent(Collider)
        );

        const movingEntities = colliders.filter(
            e => e.getComponent(Velocity)
        );

        for (let i = 0; i < movingEntities.length; i++) {
            const entityA = movingEntities[i];
            
            const posA = entityA.getComponent(Position);
            const velA = entityA.getComponent(Velocity);
            const colliderA = entityA.getComponent(Collider);
            if (!posA || !velA || !colliderA) continue;
            colliderA.isOnCollide = false;
            const boxA = colliderA.getAABB(posA.x, posA.y);

            // Check for collision with every other moving entity
            for (let j = 0; j < colliders.length; j++) {
                const entityB = colliders[j];
                if (entityB != entityA) {
                    const posB = entityB.getComponent(Position);
                    const colliderB = entityB.getComponent(Collider);

                    if (!posB || !colliderB) continue;

                    const boxB = colliderB.getAABB(posB.x, posB.y);

                    // Check if the two boxes intersect
                    if (this.boxIntersect(boxA, boxB)) {
                        colliderA.isOnCollide = true;
                        this.handleCollision(entityA, entityB, posA, posB, colliderA, colliderB);
                    }
                }
            }
        }
    }

    private getDamageMultiplier(sourceTeam: number, targetEntity: Entity): number {
        const isTargetPlayer = targetEntity.getComponent(PlayerControlled);
        
        if (sourceTeam === 2 && isTargetPlayer) { // Enemy bullet hitting player
            return 0.005; // 0.5% damage
        } else if (sourceTeam === 1 && !isTargetPlayer) { // Player bullet hitting enemy
            return 0.5; // 10% damage
        }
        
        return 1; // Default multiplier
    }

    private handleBulletCollisions(entities: Entity[]): void {
        const triggers = entities.filter(
            e => e.getComponent(Trigger)
        );

        const bullets = triggers.filter(
            e => e.getComponent(Bullet)
        );

        for (const bulletEntity of bullets) {
            const bulletTrigger = bulletEntity.getComponent(Trigger);
            const bulletPos = bulletEntity.getComponent(Position);
            const bullet = bulletEntity.getComponent(Bullet);
            const bulletTeam = bulletEntity.getComponent(Team);
            
            if (!bulletTrigger || !bulletPos || !bullet || !bulletTeam) continue;
            
            const boxA = bulletTrigger.getAABB(bulletPos.x, bulletPos.y);
            
            for (const targetEntity of triggers) {
                // Skip if it's the bullet itself
                if (targetEntity === bulletEntity) continue;

                const targetTrigger = targetEntity.getComponent(Trigger);
                const targetPos = targetEntity.getComponent(Position);
                const targetTeam = targetEntity.getComponent(Team);
                
                // Skip if missing components or same team
                if (!targetPos || !targetTrigger || !targetTeam || targetTeam.teamId === bulletTeam.teamId) continue;
                
                const boxB = targetTrigger.getAABB(targetPos.x, targetPos.y);
                
                // Check if the bullet hits the target
                if (this.boxIntersect(boxA, boxB)) {
                    const targetHealth = targetEntity.getComponent(Health);
                    if (targetHealth) {
                        // Get damage multiplier based on teams
                        const multiplier = this.getDamageMultiplier(bulletTeam.teamId, targetEntity);
                        
                        // Apply bullet damage with multiplier
                        const damage = targetHealth.takeDamage({
                            amount: bullet.damage * multiplier,
                            type: bullet.damageType,
                            source: bulletEntity.id
                        });

                        // Apply status effect if bullet has one
                        if (bullet.statusEffect) {
                            targetHealth.addStatusEffect(bullet.statusEffect);
                        }

                        // Remove bullet after hit
                        this.world.removeEntity(bulletEntity.id);
                        
                        // Play death animation and remove target if dead
                        if (targetHealth.isDead()) {
                            const animator = targetEntity.getComponent(CharacterAnimator);
                            if (animator) {
                                animator.setState(CharacterState.DEAD);
                                // Mark entity as dying to prevent further state changes
                                const velocity = targetEntity.getComponent(Velocity);
                                if (velocity) {
                                    velocity.x = 0;
                                    velocity.y = 0;
                                    velocity.affectedByGravity = false;
                                }
                                // Remove entity after animation duration
                                setTimeout(() => {
                                    this.world.removeEntity(targetEntity.id);
                                }, 1000); // 1 second for death animation
                            } else {
                                this.world.removeEntity(targetEntity.id);
                            }
                        }
                        
                        // Break since bullet is destroyed
                        break;
                    }
                }
            }
        }
    }

    private handleCollision(entityA: Entity, entityB: Entity, posA: Position, posB: Position,
        colliderA: Collider, colliderB: Collider): void {

        if (!colliderA.isTrigger && !colliderB.isTrigger) {
            // Calculate overlap width and height
            const boxA = colliderA.getAABB(posA.x, posA.y);
            const boxB = colliderB.getAABB(posB.x, posB.y);

            const overlapX = Math.min(boxA.x + boxA.width - boxB.x, boxB.x + boxB.width - boxA.x);
            const overlapY = Math.min(boxA.y + boxA.height - boxB.y, boxB.y + boxB.height - boxA.y);

            const velA = entityA.getComponent(Velocity);

            // If there is overlap in the X axis, adjust the positions
            if (overlapX < overlapY) {
                // Push entityA out of entityB in the X direction
                if (boxA.x < boxB.x) {
                    posA.x = boxB.x - boxA.width - colliderA.offsetX; // Move left
                    if (velA) velA.x = Math.min(0, velA.x); // Stop moving right
                } else {
                    posA.x = boxB.x + boxB.width - colliderA.offsetX; // Move right
                    if (velA) velA.x = Math.max(0, velA.x); // Stop moving left
                }
            } else {
                // Push entityA out of entityB in the Y direction
                if (boxA.y < boxB.y) {
                    posA.y = boxB.y - boxA.height - colliderA.offsetY; // Move up
                    if (velA) {
                        velA.y = Math.min(0, velA.y); // Stop falling
                        velA.onGround = true; // Set onGround when landing on a platform
                        velA.affectedByGravity = false; // Disable gravity when landing
                        
                        // Update animation when landing
                        const animator = entityA.getComponent(CharacterAnimator);
                        if (animator && animator.getCurrentState() === CharacterState.JUMP) {
                            if (Math.abs(velA.x) > 0) {
                                animator.setState(CharacterState.RUN);
                            } else {
                                animator.setState(CharacterState.IDLE);
                            }
                        }
                    }
                } else {
                    posA.y = boxB.y + boxB.height - colliderA.offsetY; // Move down
                    if (velA) velA.y = Math.max(0, velA.y); // Stop moving up
                }
            }
        }

        const healthA = entityA.getComponent(Health);
        const healthB = entityB.getComponent(Health);

        if (healthA && healthB) {
            // Apply collision damage with physical type
            const damageA = healthA.takeDamage({
                amount: 5,
                type: DamageType.PHYSICAL,
                source: entityB.id
            });

            const damageB = healthB.takeDamage({
                amount: 5,
                type: DamageType.PHYSICAL,
                source: entityA.id
            });

            // Check for death and remove entity if needed
            if (healthA.isDead()) {
                const animatorA = entityA.getComponent(CharacterAnimator);
                if (animatorA) {
                    animatorA.setState(CharacterState.DEAD);
                    // Mark entity as dying to prevent further state changes
                    const velocityA = entityA.getComponent(Velocity);
                    if (velocityA) {
                        velocityA.x = 0;
                        velocityA.y = 0;
                        velocityA.affectedByGravity = false;
                    }
                    // Remove entity after animation duration
                    setTimeout(() => {
                        this.world.removeEntity(entityA.id);
                    }, 1000); // 1 second for death animation
                } else {
                    this.world.removeEntity(entityA.id);
                }
            }

            if (healthB.isDead()) {
                const animatorB = entityB.getComponent(CharacterAnimator);
                if (animatorB) {
                    animatorB.setState(CharacterState.DEAD);
                    // Mark entity as dying to prevent further state changes
                    const velocityB = entityB.getComponent(Velocity);
                    if (velocityB) {
                        velocityB.x = 0;
                        velocityB.y = 0;
                        velocityB.affectedByGravity = false;
                    }
                    // Remove entity after animation duration
                    setTimeout(() => {
                        this.world.removeEntity(entityB.id);
                    }, 1000); // 1 second for death animation
                } else {
                    this.world.removeEntity(entityB.id);
                }
            }
        }
    }

    private boxIntersect(a: { x: number, y: number, width: number, height: number },
                        b: { x: number, y: number, width: number, height: number }): boolean {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
}




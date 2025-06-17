import { System } from '../base/system';
import { Entity } from '../base/entity';
import { Component } from '../base/component';
import { World } from '../base/world';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Health } from '../components/health';
import { Team } from '../components/team';
import { CharacterAnimator, CharacterState } from '../components/characterAnimator';
import { Collider } from '../components/collider';
// import { Team } from '../components/team';

export enum AIState {
    PATROL = 'patrol',
    SEEK = 'seek',
    ATTACK = 'attack',
    RETREAT = 'retreat',
    DODGE = 'dodge'
}

export class AIController extends Component {
    public state: AIState = AIState.PATROL;
    public targetId?: number;
    public patrolPoints: { x: number, y: number }[] = [];
    public currentPatrolIndex: number = 0;
    public lastStateChange: number = 0;
    public stateCooldown: number = 0.5; // Seconds between state changes
    public retreatThreshold: number = 0.3; // Retreat at 30% health
    public seekRange: number = 300; // Pixels
    public attackRange: number = 150; // Pixels
    public lastMoveTime: number = 0;
    public moveInterval: number = 30; // Seconds between movement periods
    public moveDuration: number = 3; // Seconds to move when active
    public isMoving: boolean = false;

    constructor(entityId: number) {
        super(entityId);
    }

    setState(newState: AIState): void {
        const now = Date.now() / 1000;
        if (now - this.lastStateChange < this.stateCooldown) return;
        
        this.state = newState;
        this.lastStateChange = now;
    }

    shouldMove(): boolean {
        const now = Date.now() / 1000;
        if (!this.isMoving) {
            if (now - this.lastMoveTime >= this.moveInterval) {
                this.isMoving = true;
                this.lastMoveTime = now;
                return true;
            }
        } else if (now - this.lastMoveTime >= this.moveDuration) {
            this.isMoving = false;
        }
        return this.isMoving;
    }
}

export class AISystem extends System {
    private readonly MOVE_SPEED = 150; // Slightly slower than player
    private readonly GRAVITY = 800; // Same as player

    constructor(private world: World) {
        super();
        this.requiredComponents = [AIController, Position, Velocity];
    }

    update(delta: number, entities: Entity[]): void {
        const aiEntities = entities.filter(entity => entity.getComponent(AIController));
        
        for (const entity of aiEntities) {
            const ai = entity.getComponent(AIController);
            const pos = entity.getComponent(Position);
            const vel = entity.getComponent(Velocity);
            const health = entity.getComponent(Health);
            const team = entity.getComponent(Team);
            const collider = entity.getComponent(Collider);
            const animator = entity.getComponent(CharacterAnimator);
            
            if (!ai || !pos || !vel || !health || !team) continue;

            // Check if we're actually on ground by looking at collision state
            if (vel.onGround && collider && !collider.isOnCollide) {
                vel.onGround = false;
                vel.affectedByGravity = true;
                if (animator) {
                    animator.setState(CharacterState.JUMP);
                }
            }

            // Apply gravity if not on ground
            if (!vel.onGround && vel.affectedByGravity) {
                vel.y += this.GRAVITY * delta;
            }

            // Reset horizontal velocity
            vel.x = 0;

            // Only move if it's time to move or if retreating/attacking
            const shouldMove = ai.shouldMove() || ai.state === AIState.RETREAT || health.getHealthPercentage() < ai.retreatThreshold;

            if (shouldMove) {
                // Check if we should retreat
                if (health.getHealthPercentage() < ai.retreatThreshold) {
                    ai.setState(AIState.RETREAT);
                }

                // Find nearest enemy
                const nearestEnemy = this.findNearestEnemy(pos, team.teamId, entities);
                
                if (nearestEnemy) {
                    const enemyPos = nearestEnemy.getComponent(Position);
                    if (enemyPos) {
                        const distance = this.getDistance(pos, enemyPos);
                        
                        // Update AI state based on distance and current state
                        if (distance <= ai.attackRange) {
                            ai.setState(AIState.ATTACK);
                            ai.targetId = nearestEnemy.id;
                        } else if (distance <= ai.seekRange) {
                            ai.setState(AIState.SEEK);
                            ai.targetId = nearestEnemy.id;
                        } else {
                            ai.setState(AIState.PATROL);
                            ai.targetId = undefined;
                        }
                    }
                }

                // Handle movement based on state
                switch (ai.state) {
                    case AIState.PATROL:
                        this.handlePatrol(entity, ai, pos, vel, animator || null);
                        break;
                    case AIState.SEEK:
                        this.handleSeek(entity, ai, pos, vel, animator || null);
                        break;
                    case AIState.ATTACK:
                        this.handleAttack(entity, ai, pos, vel, animator || null);
                        break;
                    case AIState.RETREAT:
                        this.handleRetreat(entity, ai, pos, vel, animator || null);
                        break;
                }
            }

            // Update animation based on movement if on ground
            if (animator && vel.onGround) {
                if (Math.abs(vel.x) > 0) {
                    animator.setState(CharacterState.RUN);
                } else {
                    animator.setState(CharacterState.IDLE);
                }
            }
        }
    }

    private findNearestEnemy(pos: Position, teamId: number, entities: Entity[]): Entity | null {
        let nearest: Entity | null = null;
        let minDistance = Infinity;

        for (const entity of entities) {
            const entityTeam = entity.getComponent(Team);
            const entityPos = entity.getComponent(Position);
            const entityHealth = entity.getComponent(Health);

            if (entityTeam && entityPos && entityHealth && 
                entityTeam.teamId !== teamId && 
                !entityHealth.isDead()) {
                
                const distance = this.getDistance(pos, entityPos);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = entity;
                }
            }
        }

        return nearest;
    }

    private getDistance(pos1: Position, pos2: Position): number {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private handlePatrol(entity: Entity, ai: AIController, pos: Position, vel: Velocity, animator: CharacterAnimator | null): void {
        // Simple left-right patrol
        if (ai.patrolPoints.length === 0) {
            ai.patrolPoints = [
                { x: pos.x - 200, y: pos.y },
                { x: pos.x + 200, y: pos.y }
            ];
        }

        const target = ai.patrolPoints[ai.currentPatrolIndex];
        const dx = target.x - pos.x;

        // Move towards patrol point
        if (Math.abs(dx) > 10) {
            vel.x = Math.sign(dx) * this.MOVE_SPEED;
        } else {
            // Switch to next patrol point
            ai.currentPatrolIndex = (ai.currentPatrolIndex + 1) % ai.patrolPoints.length;
            vel.x = 0;
        }
    }

    private handleSeek(entity: Entity, ai: AIController, pos: Position, vel: Velocity, animator: CharacterAnimator | null): void {
        if (!ai.targetId) return;

        const target = this.world.getEntity(ai.targetId);
        if (!target) {
            ai.setState(AIState.PATROL);
            return;
        }

        const targetPos = target.getComponent(Position);
        if (!targetPos) return;

        const dx = targetPos.x - pos.x;
        vel.x = Math.sign(dx) * this.MOVE_SPEED;
    }

    private handleAttack(entity: Entity, ai: AIController, pos: Position, vel: Velocity, animator: CharacterAnimator | null): void {
        if (!ai.targetId) return;

        const target = this.world.getEntity(ai.targetId);
        if (!target) {
            ai.setState(AIState.PATROL);
            return;
        }

        const targetPos = target.getComponent(Position);
        if (!targetPos) return;

        // Stop moving and face the target
        vel.x = 0;
    }

    private handleRetreat(entity: Entity, ai: AIController, pos: Position, vel: Velocity, animator: CharacterAnimator | null): void {
        if (!ai.targetId) {
            ai.setState(AIState.PATROL);
            return;
        }

        const target = this.world.getEntity(ai.targetId);
        if (!target) {
            ai.setState(AIState.PATROL);
            return;
        }

        const targetPos = target.getComponent(Position);
        if (!targetPos) return;

        // Move away from target
        const dx = targetPos.x - pos.x;
        vel.x = -Math.sign(dx) * this.MOVE_SPEED;
    }

    private handleDodge(entity: Entity, ai: AIController, pos: Position, vel: Velocity): void {
        // TODO: Implement dodge logic (e.g., move perpendicular to incoming projectiles)
    }
} 
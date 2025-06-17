import { System } from '../base/system';
import { World } from '../base/world';
import { Gun } from '../components/gun';
import { Position } from '../components/position';
import { BulletEntity } from '../entities/bulletEntity';
import { Entity } from '../base/entity';
import { PlayerControlled } from '../components/playerControlled';
import { Team } from '../components/team';
import MainGame from '../../mainGame';
import { Point } from 'pixi.js';
import { SpritesAnimationRenderer } from '../components/spritesAnimationRenderer';
import { CharacterAnimator, CharacterState } from '../components/characterAnimator';

export class FiringSystem extends System {
    private fireCooldowns: Map<number, number> = new Map();
    private readonly FIRE_RATE = 0.6; // Seconds between shots
    private readonly BULLET_SPEED = 400;
    private readonly AI_FIRE_CHANCE = 0.1; // 10% chance to fire when off cooldown
    private readonly AI_SPREAD_ANGLE = Math.PI * 0.2; // ±18 degrees spread
    private readonly ATTACK_ANIMATION_DURATION = 0.3; // Duration of attack animation in seconds
    private readonly BULLET_FIRE_DELAY = 0.15; // Delay before bullet appears (half of animation duration)
    private attackAnimationTimers: Map<number, number> = new Map();
    private pendingBullets: Map<number, {x: number, y: number, angle: number, entity: Entity}> = new Map();

    private flipEnemyDirection(entity: Entity, targetX: number, entityX: number): void {
        const spriteRenderer = entity.getComponent(SpritesAnimationRenderer);
        const gun = entity.getComponent(Gun);
        if (spriteRenderer) {
            const shouldFaceLeft = targetX < entityX;
            const sprite = spriteRenderer.sprite;
            if (shouldFaceLeft) {
                if (gun) gun.offsetX = -Math.abs(gun.offsetX);
                sprite.scale.x = Math.abs(sprite.scale.x) * -1;
                sprite.position.x = 30;
            } else {
                if (gun) gun.offsetX = Math.abs(gun.offsetX);
                sprite.scale.x = Math.abs(sprite.scale.x) * 1;
                sprite.position.x = 0;
            }
        }
    }

    constructor(private world: World) {
        super();
        this.requiredComponents = [Gun, Position, Team];
    }

    update(delta: number, entities: Entity[]): void {
        // Update cooldowns
        for (const [entityId, cooldown] of this.fireCooldowns.entries()) {
            if (cooldown > 0) {
                this.fireCooldowns.set(entityId, cooldown - delta);
            }
        }

        // Update attack animation timers and handle delayed bullet firing
        for (const [entityId, timer] of this.attackAnimationTimers.entries()) {
            if (timer > 0) {
                const newTimer = timer - delta;
                this.attackAnimationTimers.set(entityId, newTimer);
                
                // Check if it's time to fire the bullet
                const pendingBullet = this.pendingBullets.get(entityId);
                if (pendingBullet && timer > newTimer && newTimer <= (this.ATTACK_ANIMATION_DURATION - this.BULLET_FIRE_DELAY)) {
                    const { x, y, angle, entity } = pendingBullet;
                    this.createBullet(entity, x, y, angle);
                    this.pendingBullets.delete(entityId);
                }
                
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

        // Group entities by team
        const teamEntities = new Map<number, Entity[]>();
        for (const entity of entities) {
            const team = entity.getComponent(Team);
            if (team) {
                if (!teamEntities.has(team.teamId)) {
                    teamEntities.set(team.teamId, []);
                }
                teamEntities.get(team.teamId)!.push(entity);
            }
        }

        // Handle firing for each entity
        for (const entity of entities) {
            const pos = entity.getComponent(Position);
            const gun = entity.getComponent(Gun);
            const team = entity.getComponent(Team);

            if (!pos || !gun || !team) continue;

            // Get cooldown
            const cooldown = this.fireCooldowns.get(entity.id) || 0;
            if (cooldown > 0) continue;

            // Handle player and AI firing differently
            if (entity.getComponent(PlayerControlled)) {
                this.handlePlayerFiring(entity, pos, gun);
            } else {
                this.handleAIFiring(entity, pos, gun, team, teamEntities);
            }
        }
    }

    private handlePlayerFiring(entity: Entity, pos: Position, gun: Gun): void {
        if (!MainGame.instance.isMouseDown) return;

        // Get mouse position in world space
        const mousePos = MainGame.instance.mouseDownPosition;
        const worldPos = new Point(
            mousePos.x - MainGame.instance.screenCenterX,
            mousePos.y - MainGame.instance.screenCenterY
        );

        // Calculate gun position and direction
        const sprite = entity.getComponent(SpritesAnimationRenderer);
        const facingLeft = sprite && sprite.sprite.scale.x < 0;
        const gunWorldX = pos.x + (facingLeft ? -gun.offsetX : gun.offsetX);
        const gunWorldY = pos.y + gun.offsetY;

        // Fire at mouse position
        const angle = Math.atan2(worldPos.y - gunWorldY, worldPos.x - gunWorldX);
        this.fireBullet(entity, gunWorldX, gunWorldY, angle);
    }

    private handleAIFiring(
        entity: Entity, 
        pos: Position, 
        gun: Gun, 
        team: Team,
        teamEntities: Map<number, Entity[]>
    ): void {
        if (Math.random() >= this.AI_FIRE_CHANCE) return;

        // Find closest enemy from other teams
        let closestEnemy: Entity | null = null;
        let closestDistance = Infinity;

        for (const [teamId, enemies] of teamEntities.entries()) {
            if (teamId === team.teamId) continue; // Skip own team

            for (const enemy of enemies) {
                const enemyPos = enemy.getComponent(Position);
                if (!enemyPos) continue;

                const dx = enemyPos.x - pos.x;
                const dy = enemyPos.y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
        }

        if (!closestEnemy) return;

        // Get enemy position
        const enemyPos = closestEnemy.getComponent(Position);
        if (!enemyPos) return;

        // Flip enemy sprite based on target position
        this.flipEnemyDirection(entity, enemyPos.x, pos.x);

        // Calculate gun position and direction
        const sprite = entity.getComponent(SpritesAnimationRenderer);
        const facingLeft = sprite && sprite.sprite.scale.x < 0;
        const gunWorldX = pos.x + (facingLeft ? -gun.offsetX : gun.offsetX);
        const gunWorldY = pos.y + gun.offsetY;

        // Calculate firing angle with spread
        const baseAngle = Math.atan2(enemyPos.y - gunWorldY, enemyPos.x - gunWorldX);
        const spread = (Math.random() - 0.5) * this.AI_SPREAD_ANGLE;
        this.fireBullet(entity, gunWorldX, gunWorldY, baseAngle + spread);
    }

    private fireBullet(entity: Entity, x: number, y: number, angle: number): void {
        // Set cooldown
        this.fireCooldowns.set(entity.id, this.FIRE_RATE);

        // Store bullet info for delayed firing
        this.pendingBullets.set(entity.id, {x, y, angle, entity});

        // Trigger attack animation
        const animator = entity.getComponent(CharacterAnimator);
        if (animator) {
            animator.setState(CharacterState.SHOOT);
            this.attackAnimationTimers.set(entity.id, this.ATTACK_ANIMATION_DURATION);
        }
    }

    private createBullet(entity: Entity, x: number, y: number, angle: number): void {
        // Create bullet
        const bullet = new BulletEntity(
            x, y,
            Math.cos(angle) * this.BULLET_SPEED,
            Math.sin(angle) * this.BULLET_SPEED,
            entity
        );
        this.world.addEntity(bullet);
    }
}

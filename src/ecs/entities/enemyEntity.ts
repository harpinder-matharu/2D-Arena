import { Entity } from '../base/entity';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Health } from '../components/health';
import { Assets, Texture } from 'pixi.js';
import { Gun } from '../components/gun';
import { SpritesAnimationRenderer } from '../components/spritesAnimationRenderer';
import { Collider } from '../components/collider';
import { Trigger } from '../components/trigger';
import { Team } from '../components/team';
import { AIController } from '../systems/aiSystem';
import { CharacterAnimator } from '../components/characterAnimator';

export async function createEnemyEntity(): Promise<Entity> {
    const entity = new Entity();
    // Spawn enemies higher up
    entity.addComponent(new Position(entity.id, Math.random() * 1200 - 600, -Math.random() * 600 - 300));
    entity.addComponent(new Velocity(entity.id, 0, 0, true, false)); // Start on ground with gravity disabled, like player
    entity.addComponent(new Health(entity.id, 100, 100)); // 100 HP
    entity.addComponent(new Team(entity.id, 2)); // Enemy team
    entity.addComponent(new AIController(entity.id));

    // Load the first idle frame for initial sprite
    const idleTexture = await Assets.load('./characters/Enemy/Idle/Idle1.png');
    
    const spriteRenderer = new SpritesAnimationRenderer(entity.id, [idleTexture], {
        scale: 0.2,
        offsetX: 0,
    });
    entity.addComponent(spriteRenderer);

    const animator = new CharacterAnimator(entity.id, 'Enemy');
    await animator.init(spriteRenderer);
    entity.addComponent(animator);

    entity.addComponent(new Gun(entity.id, 40, 70));
    entity.addComponent(new Trigger(entity.id, 34, 100, -2, -2)); // trigger-type collider
    entity.addComponent(new Collider(entity.id, 30, 100, 0, 0)); // Adjusted collider to match sprite height and centered position
    return entity;
}
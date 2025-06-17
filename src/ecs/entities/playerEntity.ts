import { Entity } from '../base/entity';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Health } from '../components/health';
import { Assets, Texture } from 'pixi.js';
import { Gun } from '../components/gun';
import { SpritesAnimationRenderer } from '../components/spritesAnimationRenderer';
import { Collider } from '../components/collider';
import { PlayerControlled } from '../components/playerControlled';
import { Trigger } from '../components/trigger';
import { Team } from '../components/team';
import { CharacterAnimator } from '../components/characterAnimator';

export async function createPlayerEntity(): Promise<Entity> {
    const entity = new Entity();
    // Spawn players higher up
    entity.addComponent(new Position(entity.id, Math.random() * 800 - 400, -Math.random() * 400 - 200));
    entity.addComponent(new Velocity(entity.id, 0, 0, true, false));
    entity.addComponent(new Health(entity.id, 100, 100)); // 100 HP
    entity.addComponent(new Team(entity.id, 1)); // Player team

    // Load the first idle frame for initial sprite
    const idleTexture = await Assets.load('./characters/Player/Idle/Idle1.png');
    
    const spriteRenderer = new SpritesAnimationRenderer(entity.id, [idleTexture], {
        scale: 0.2,
        offsetX: 0,
    });
    entity.addComponent(spriteRenderer);

    const animator = new CharacterAnimator(entity.id, 'Player');
    await animator.init(spriteRenderer);
    entity.addComponent(animator);

    entity.addComponent(new Gun(entity.id, 40, 70));
    entity.addComponent(new Trigger(entity.id, 34, 100, -2, -2)); // trigger-type collider
    entity.addComponent(new Collider(entity.id, 30, 100, 0, 0)); // Adjusted collider to match sprite height and centered position
    entity.addComponent(new PlayerControlled(entity.id)); 
    return entity;
}
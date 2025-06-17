import { Container, Graphics, Sprite } from 'pixi.js';
import { System } from '../base/system';
import { Health } from '../components/health';
import { World } from '../base/world';
import { Bullet } from '../components/bullet';
import { Position } from '../components/position';
import { SpriteRenderer } from '../components/spriteRenderer';
import { SpritesAnimationRenderer } from '../components/spritesAnimationRenderer';
import { Entity } from '../base/entity';

export class RenderSystem extends System {
    private sprites: Map<number, Container> = new Map();

    constructor(private world: World, private stage: Container) {
        super(100); // Lowest priority to render on top
        this.requiredComponents = [Position];
    }

    update(delta: number, entities: Entity[]): void {
        for (const entity of entities) {
            let container = this.sprites.get(entity.id);

            if (!container) {
                // Create container for sprite + HP bar
                container = new Container();

                const spriteRender = entity.getComponent(SpriteRenderer);
                
                if (spriteRender) {
                    container.addChild(spriteRender.sprite);
                    spriteRender.sprite.position.set(spriteRender.offsetX, spriteRender.offsetY);
                    container['sprite'] = spriteRender.sprite; // Custom property
                } else {
                    const spriteRenderanimation = entity.getComponent(SpritesAnimationRenderer);
                    if (spriteRenderanimation) {
                        spriteRenderanimation.sprite.position.set(spriteRenderanimation.offsetX, spriteRenderanimation.offsetY);
                        container.addChild(spriteRenderanimation.sprite);
                        container['sprite'] = spriteRenderanimation.sprite; // Custom property
                    }
                }

                // Add HP bar only if entity has health
                if (entity.getComponent(Health)) {
                    const hpBar = new Graphics();
                    hpBar.y = -15; // Position above the bot
                    container.addChild(hpBar);
                    container['hpBar'] = hpBar; // Custom property
                }

                this.stage.addChild(container);
                this.sprites.set(entity.id, container);
            }

            // Update position
            const pos = entity.getComponent(Position);
            if (pos) {
                container.x = pos.x;
                container.y = pos.y;
            }

            // Update HP bar if exists
            const health = entity.getComponent(Health);
            if (health && container['hpBar']) {
                const hpBar = container['hpBar'] as Graphics;
                const healthPercent = health.current / health.max;
                hpBar.clear();

                // Constants for health bar
                const barWidth = 32;
                const barHeight = 6;
                const cornerRadius = 3;
                
                // Draw border with shadow effect
                hpBar.lineStyle(1, 0x000000, 0.5);
                hpBar.beginFill(0x000000, 0.3);
                hpBar.drawRoundedRect(-2, -2, barWidth + 4, barHeight + 4, cornerRadius);
                hpBar.endFill();

                // Draw background
                hpBar.lineStyle(1, 0x000000, 0.8);
                hpBar.beginFill(0x333333);
                hpBar.drawRoundedRect(0, 0, barWidth, barHeight, cornerRadius);
                hpBar.endFill();

                // Calculate health bar color based on percentage
                const healthColor = healthPercent > 0.6 ? 0x00ff00 : 
                                  healthPercent > 0.3 ? 0xffff00 : 
                                  0xff0000;

                // Draw health bar with gradient effect
                const currentWidth = Math.max(0, barWidth * healthPercent);
                if (currentWidth > 0) {
                    hpBar.lineStyle(0);
                    // Add glow effect for low health
                    if (healthPercent <= 0.3) {
                        hpBar.beginFill(healthColor, 0.3);
                        hpBar.drawRoundedRect(-1, -1, currentWidth + 2, barHeight + 2, cornerRadius);
                    }
                    // Main health bar
                    hpBar.beginFill(healthColor);
                    hpBar.drawRoundedRect(0, 0, currentWidth, barHeight, cornerRadius);
                    // Add highlight effect
                    hpBar.beginFill(0xffffff, 0.3);
                    hpBar.drawRoundedRect(0, 0, currentWidth, barHeight/2, cornerRadius);
                    hpBar.endFill();
                }
            }
        }

        // Clean up dead entities
        const activeEntities = this.world.getEntitiesWithComponents(Position);
        for (const [id, container] of this.sprites.entries()) {
            if (!activeEntities.some(e => e.id === id)) {
                this.stage.removeChild(container);
                this.sprites.delete(id);
            }
        }
    }
}

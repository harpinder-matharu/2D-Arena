import { System } from '../base/system';
import { Entity } from '../base/entity';
import { Health } from '../components/health';

export class StatusEffectSystem extends System {
    constructor() {
        super(10); // High priority to process status effects before other systems
    }

    update(delta: number, entities: Entity[]): void {
        const entitiesWithHealth = entities.filter(entity => entity.getComponent(Health));
        
        for (const entity of entitiesWithHealth) {
            const health = entity.getComponent(Health);
            if (health) {
                health.updateStatusEffects(delta);
            }
        }
    }
} 
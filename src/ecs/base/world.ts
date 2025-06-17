import { Entity } from './entity';
import { System } from './system';
import { Component } from './component';

export interface Bound {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export class World {
    bound: Bound;
    private entities: Entity[] = [];
    private systems: System[] = [];
    private entityMap: Map<number, Entity> = new Map();
    
    constructor(bound?: Bound) {
        this.bound = bound || { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    }

    addEntity(entity: Entity): void {
        this.entities.push(entity);
        this.entityMap.set(entity.id, entity);
    }

    removeEntity(entityId: number): void {
        const entity = this.entityMap.get(entityId);
        if (entity) {
            entity.destroy();
            this.entities = this.entities.filter(e => e.id !== entityId);
            this.entityMap.delete(entityId);
        }
    }

    getEntity(entityId: number): Entity | undefined {
        return this.entityMap.get(entityId);
    }

    addSystem(system: System): void {
        this.systems.push(system);
        this.systems.sort((a, b) => a.priority - b.priority);
    }

    removeSystem(system: System): void {
        this.systems = this.systems.filter(s => s !== system);
    }

    getEntitiesWithComponents<T extends Component>(...componentTypes: (new (...args: any[]) => T)[]): Entity[] {
        return this.entities.filter(entity => 
            entity.isActive && 
            componentTypes.every(type => entity.hasComponent(type))
        );
    }

    update(delta: number): void {
        // Update all systems in priority order
        for (const system of this.systems) {
            const matchingEntities = this.entities.filter(entity => 
                entity.isActive && system.matches(entity)
            );
            system.update(delta, matchingEntities);
        }

        // Clean up destroyed entities
        this.entities = this.entities.filter(entity => entity.isActive);
    }
}

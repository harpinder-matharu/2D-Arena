import { Entity } from './entity';
import { Component } from './component';

export abstract class System {
    priority: number = 0;
    requiredComponents: (new (...args: any[]) => Component)[] = [];
    
    constructor(priority: number = 0) {
        this.priority = priority;
    }

    abstract update(delta: number, entities: Entity[]): void;

    matches(entity: Entity): boolean {
        return this.requiredComponents.every(componentType => 
            entity.getComponent(componentType) !== undefined
        );
    }
}
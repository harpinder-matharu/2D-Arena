import { Component } from './component';

let idCounter = 0;

export class Entity {
    id: number;
    components: Map<string, Component> = new Map();
    isActive: boolean = true;

    constructor() {
        this.id = idCounter++;
    }

    addComponent<T extends Component>(component: T): T {
        const componentName = component.constructor.name;
        if (this.components.has(componentName)) {
            this.removeComponent(component.constructor as new (...args: any[]) => Component);
        }
        this.components.set(componentName, component);
        component.onAttach();
        return component;
    }

    removeComponent<T extends Component>(type: new (...args: any[]) => T): void {
        const component = this.components.get(type.name);
        if (component) {
            component.onDetach();
            this.components.delete(type.name);
        }
    }

    getComponent<T extends Component>(type: new (...args: any[]) => T): T | undefined {
        return this.components.get(type.name) as T;
    }

    hasComponent<T extends Component>(type: new (...args: any[]) => T): boolean {
        return this.components.has(type.name);
    }

    destroy(): void {
        this.isActive = false;
        for (const component of this.components.values()) {
            component.onDetach();
        }
        this.components.clear();
    }
}
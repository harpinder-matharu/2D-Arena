export abstract class Component {
    entityId: number;
    
    constructor(entityId: number) {
        this.entityId = entityId;
    }

    onAttach(): void {}
    onDetach(): void {}
}
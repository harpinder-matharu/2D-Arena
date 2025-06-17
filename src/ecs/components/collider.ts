import { Component } from "../base/component";

export class Collider extends Component {
    public isTrigger: boolean = false;
    public isOnCollide: boolean = false;

    constructor(
        entityId: number,
        public width: number,
        public height: number,
        public offsetX: number = 0,
        public offsetY: number = 0,
    ) {
        super(entityId);
    }

    // Get the AABB (Axis-Aligned Bounding Box) based on position
    getAABB(x: number, y: number) {
        return {
            x: x + this.offsetX,
            y: y + this.offsetY,
            width: this.width,
            height: this.height,
        };
    }
}
import { Collider } from "./collider";

export class Trigger extends Collider {
    override isTrigger: boolean = true;
    constructor(
        entityId: number,
        width: number,
        height: number,
        offsetX: number = 0,
        offsetY: number = 0,
    ) {
        super(entityId, width, height, offsetX, offsetY);
    }
}
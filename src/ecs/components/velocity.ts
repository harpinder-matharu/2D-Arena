import { Component } from '../base/component';

export class Velocity extends Component {
    constructor(
        entityId: number,
        public x: number = 0,
        public y: number = 0,
        public onGround: boolean = false,
        public affectedByGravity: boolean = false
    ) {
        super(entityId);
    }
}
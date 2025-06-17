import { Component } from '../base/component';

export class Gun extends Component {
    constructor(entityId: number, public offsetX: number = 0, public offsetY: number = 0) {
        super(entityId);
    }
}
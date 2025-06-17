import { Component } from '../base/component';

export class Position extends Component {
    constructor(entityId: number, public x: number = 0, public y: number = 0) {
        super(entityId);
    }
}
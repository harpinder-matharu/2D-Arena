import { Component } from '../base/component';

export class Lifetime extends Component {
    constructor(entityId: number, public duration: number = 2) {
        super(entityId);
    }
}

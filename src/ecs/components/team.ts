import { Component } from '../base/component';

export class Team extends Component {
    constructor(entityId: number, public teamId: number) {
        super(entityId);
    }
} 
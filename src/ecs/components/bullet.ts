import { Component } from '../base/component';
import { DamageType, StatusEffect } from './health';

export class Bullet extends Component {
    constructor(
        entityId: number,
        public damage: number = 10,
        public damageType: DamageType = DamageType.PHYSICAL,
        public statusEffect?: StatusEffect
    ) {
        super(entityId);
    }
}
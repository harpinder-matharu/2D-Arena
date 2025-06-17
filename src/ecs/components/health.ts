import { Component } from '../base/component';

export enum DamageType {
    PHYSICAL = 'physical',
    FIRE = 'fire',
    POISON = 'poison',
    ELECTRIC = 'electric'
}

export interface DamageInfo {
    amount: number;
    type: DamageType;
    source?: number; // Entity ID that caused the damage
}

export interface StatusEffect {
    type: DamageType;
    duration: number;
    tickRate: number;
    damagePerTick: number;
    lastTick: number;
}

export class Health extends Component {
    private statusEffects: StatusEffect[] = [];
    public isInvulnerable: boolean = false;
    public lastDamageTime: number = 0;
    public damageCooldown: number = 0.5; // Seconds between damage instances
    public lastDamageTaken: number = 0;

    constructor(
        entityId: number,
        public current: number = 100,
        public max: number = 100,
        public armor: number = 0,
        public resistances: Map<DamageType, number> = new Map()
    ) {
        super(entityId);
        // Initialize default resistances
        Object.values(DamageType).forEach(type => {
            this.resistances.set(type, 0);
        });
    }

    takeDamage(damage: DamageInfo): number {
        if (this.isInvulnerable) return 0;
        
        const now = Date.now() / 1000;
        if (now - this.lastDamageTime < this.damageCooldown) return 0;
        
        const resistance = this.resistances.get(damage.type) || 0;
        const actualDamage = Math.max(0, damage.amount * (1 - resistance) - this.armor);
        
        this.current = Math.max(0, this.current - actualDamage);
        this.lastDamageTime = now;
        this.lastDamageTaken = actualDamage;
        
        return actualDamage;
    }

    heal(amount: number): number {
        const oldHealth = this.current;
        this.current = Math.min(this.max, this.current + amount);
        return this.current - oldHealth;
    }

    addStatusEffect(effect: StatusEffect): void {
        const existingEffect = this.statusEffects.find(e => e.type === effect.type);
        if (existingEffect) {
            existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
            existingEffect.damagePerTick = Math.max(existingEffect.damagePerTick, effect.damagePerTick);
        } else {
            this.statusEffects.push({ ...effect, lastTick: Date.now() });
        }
    }

    updateStatusEffects(delta: number): void {
        const now = Date.now();
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.duration -= delta;
            if (effect.duration <= 0) return false;

            if (now - effect.lastTick >= effect.tickRate * 1000) {
                this.takeDamage({
                    amount: effect.damagePerTick,
                    type: effect.type
                });
                effect.lastTick = now;
            }
            return true;
        });
    }

    isDead(): boolean {
        return this.current <= 0;
    }

    getHealthPercentage(): number {
        return this.current / this.max;
    }
}
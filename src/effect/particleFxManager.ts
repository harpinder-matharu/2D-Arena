import { Application, Assets, Container, Point, Sprite, Texture } from "pixi.js";

interface Particle {
    sprite: Sprite;
    vx: number;
    vy: number;
    rotationSpeed: number;
    gravity: number;
    friction: number;
    life: number;
    alpha: number;
    decay: number;
  }

export default class ParticleFXManager {
            // Constants for animation
    TOTAL_COINS:number = 50;
    TOTAL_PARTICLES:number = 80;
    GRAVITY :number= 0.1;
    MAX_ROTATION_SPEED :number= 0.2;

    _particleContainer:Container;
    _particles : Particle[] = [];

    _coinTexture :Texture;
    _glowTexture :Texture;
    _starTexture :Texture;

    _app : Application;

    constructor(app:Application){
        this._app = app;
        this._particleContainer = new Container();
        this._particleContainer.pivot.set(0.5);
        this._particleContainer.interactive = false;
        this._particleContainer.interactiveChildren = false;
        this._particleContainer.eventMode = 'none';

      
        app.stage.addChild(this._particleContainer);
    }

    createWinEffect(): void{
        // Get center of screen
        this._particleContainer.zIndex = 1000; // Higher value = appears on top
        this._app.stage.sortChildren();

        const centerX = this._app.screen.width / 2;
        const centerY = this._app.screen.height / 2 - 150;
        // Clear any existing particles
        this._particles.forEach(p => {
            if (p.sprite.parent) {
                p.sprite.parent.removeChild(p.sprite);
            }
        });
        this._particles = [];
         
        for (let i = 0; i < this.TOTAL_PARTICLES; i++) {
            if (i % 2 == 0) {
                this._createGlowParticle(centerX, centerY);
            } else {
                this._createStarParticle(centerX, centerY);
            }
        }

        // Create coins
        for (let i = 0; i < this.TOTAL_COINS; i++) {
            this._createCoin(centerX, centerY);
        }
    }

    createStartEffect(position:Point,count:number): void{
        // Get center of screen
        this._particleContainer.zIndex = 1000; // Higher value = appears on top
        this._app.stage.sortChildren();

        const localPoint = this._particleContainer.toLocal(position);

        const centerX = localPoint.x;
        const centerY = localPoint.y;
         
        // Create glow particles
        for (let i = 0; i < count; i++) {
            this._createStarParticle(centerX, centerY);
        }
    }

    createGlowEffect(position:Point,color:number ,count:number = 10): void{
        // Get center of screen
        this._particleContainer.zIndex = 1000; // Higher value = appears on top
        this._app.stage.sortChildren();

        const localPoint = this._particleContainer.toLocal(position);

        const centerX = localPoint.x;
        const centerY = localPoint.y;
         
        // Create glow particles
        for (let i = 0; i < count; i++) {
            const glow = new Sprite(this._glowTexture);
        
            // Set appearance
            glow.anchor.set(0.5);
            glow.width = 8 + Math.random() * 8;
            glow.height = glow.width;
            
            // Random colors for glow particles
            glow.tint = color;
            
            // Initial position
            glow.x = centerX;
            glow.y = centerY;
            
            // Add physics properties
            const angle = Math.random() * Math.PI * 2;
            const power = 0.5 + Math.random();
            
            const particle : Particle = {
                sprite: glow,
                vx: Math.cos(angle) * power,
                vy: Math.sin(angle) * power,
                rotationSpeed: 0,
                gravity: this.GRAVITY * 0.1, // Less gravity for glow particles
                friction: 0.96,
                life: 1,
                alpha: 0.2,
                decay: 0.01 + Math.random() * 0.02
            };
            
            this._particleContainer.addChild(glow);
            this._particles.push(particle);
        }
    }

    _createCoin(x:number, y:number): void{
        const coin = new Sprite(this._coinTexture);
        
        // Set coin appearance
        coin.anchor.set(0.5);
        coin.width = 30;
        coin.height = 30;
        coin.tint = 0xFFFFFF; // no color
        
        // Initial position
        coin.x = x;
        coin.y = y;
        
        // Add physics properties
        const angle = Math.random() * Math.PI * 2;
        const power = 3 + Math.random() * 7;
        
        const particle : Particle = {
            sprite: coin,
            vx: Math.cos(angle) * power,
            vy: Math.sin(angle) * power,
            rotationSpeed: (Math.random() - 0.5) * this.MAX_ROTATION_SPEED,
            gravity: this.GRAVITY,
            friction: 0.98,
            life: 1,
            alpha: 0.5,
            decay: 0.003 + Math.random() * 0.01
        };
        
        this._particleContainer.addChild(coin);
        this._particles.push(particle);
    }

    _createGlowParticle(x:number, y:number) : void{
        const glow = new Sprite(this._glowTexture);
        
        // Set appearance
        glow.anchor.set(0.5);
        glow.width = 15 + Math.random() * 15;
        glow.height = glow.width;
        glow.blendMode = 'add';
        // Create glow particles
        const colors: number[] = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
        // Random colors for glow particles
        glow.tint = colors[Math.floor(Math.random() * colors.length)];
        
        // Initial position
        glow.x = x;
        glow.y = y;
        
        // Add physics properties
        const angle = Math.random() * Math.PI * 2;
        const power = 2 + Math.random() * 4;
        
        const particle : Particle = {
            sprite: glow,
            vx: Math.cos(angle) * power,
            vy: Math.sin(angle) * power,
            rotationSpeed: 0,
            gravity: this.GRAVITY * 0.5, // Less gravity for glow particles
            friction: 0.96,
            life: 1,
            alpha: 0,
            decay: 0.01 + Math.random() * 0.02
        };
        
        this._particleContainer.addChild(glow);
        this._particles.push(particle);
    }

    _createStarParticle(x:number, y:number): void {
        const star = new Sprite(this._starTexture);
        
        // Set appearance
        star.anchor.set(0.5);
        star.width = 20 + Math.random() * 20;
        star.height = star.width;
        star.tint = 0xFFFFFF;
        
        // Initial position
        star.x = x;
        star.y = y;
        
        // Add physics properties
        const angle = Math.random() * Math.PI * 2;
        const power = 2 + Math.random() * 5;
        
        const particle : Particle = {
            sprite: star,
            vx: Math.cos(angle) * power,
            vy: Math.sin(angle) * power,
            rotationSpeed: (Math.random() - 0.5) * this.MAX_ROTATION_SPEED * 2,
            gravity: this.GRAVITY * 0.7,
            friction: 0.97,
            life: 1,
            alpha: 0,
            decay: 0.01 + Math.random() * 0.02
        };
        
        this._particleContainer.addChild(star);
        this._particles.push(particle);
    }

    // Game loop
    update(delta:number) : void{
        // Update all particles
        for (let i = this._particles.length - 1; i >= 0; i--) {
            const p:Particle = this._particles[i];
            
            // Apply physics
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.vy *= p.friction;
            
            // Update position
            p.sprite.x += p.vx * delta;
            p.sprite.y += p.vy * delta;
            
            // Apply rotation if available
            if (p.rotationSpeed) {
                p.sprite.rotation += p.rotationSpeed * delta;
            }
            
            // Reduce life
            p.life -= p.decay * delta;
            
            // Set alpha based on life
            p.sprite.alpha =p.alpha +  p.life;
            
            // Remove dead particles
            if (p.life <= 0) {
                this._particleContainer.removeChild(p.sprite);
                this._particles.splice(i, 1);
            }
            
            // Bounce off bottom
            if (p.sprite.y > this._app.screen.height) {
                p.sprite.y = this._app.screen.height;
                p.vy *= -0.5; // Bounce with energy loss
            }
            
            // Bounce off sides
            if (p.sprite.x < 0 || p.sprite.x > this._app.screen.width) {
                p.vx *= -0.5; // Bounce with energy loss
            }
        }
    }
}
import { System } from '../base/system';
import { Entity } from '../base/entity';
import { World } from '../base/world';
import { Position } from '../components/position';
import { Collider } from '../components/collider';
import { Health } from '../components/health';
import { Graphics, Container, Text, TextStyle } from 'pixi.js';
import { DatGuiManager } from '../../debug/datGuiManager';
import MainGame from '../../mainGame';
import { GUI } from 'dat.gui';
import { PlayerControlSystem } from './playerControlSystem';

export class DebugSystem extends System {
    private debugContainer: Container;
    private uiContainer: Container;
    private graphics: Graphics;
    private fpsText: Text;
    private entityCountText: Text;
    private lastFpsUpdate: number = 0;
    private frameCount: number = 0;
    private _showColliders: boolean = false;
    private showHealth: boolean = false;
    private _showFPS: boolean = false;
    private gui: GUI;

    constructor(private world: World) {
        super(100); // Lowest priority to render on top
        
        // Container for world-space debug graphics
        this.debugContainer = new Container();
        this.debugContainer.zIndex = 1000;
        this.graphics = new Graphics();
        this.debugContainer.addChild(this.graphics);

        // Container for screen-space UI elements
        this.uiContainer = new Container();
        this.uiContainer.zIndex = 1001;

        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff,
            stroke: 0x000000,
        });

        // FPS counter
        this.fpsText = new Text('FPS: 0', textStyle);
        this.fpsText.x = 10;
        this.fpsText.y = 10;
        this.uiContainer.addChild(this.fpsText);

        // Entity counter
        this.entityCountText = new Text('Entities: 0', textStyle);
        this.entityCountText.position.set(10, 30);
        this.uiContainer.addChild(this.entityCountText);

        // Initialize dat.GUI
        this.gui = new GUI();
        
       
        const debugFolder = this.gui.addFolder('Debug');
        debugFolder.add(this, 'showColliders').name('Show Colliders');
        debugFolder.add(this, 'showFPS').name('Show FPS');
        debugFolder.open();

        // Add movement controls
        const movementFolder = this.gui.addFolder('Movement');
        movementFolder.add(PlayerControlSystem, 'MOVE_SPEED', 0, 400).name('Move Speed');
        movementFolder.add(PlayerControlSystem, 'JUMP_FORCE', 0, 1300).name('Jump Force');
        movementFolder.add(PlayerControlSystem, 'GRAVITY', 0, 1600).name('Gravity');
        movementFolder.open();
    }

    // Getters and setters for properties
    get showColliders(): boolean {
        return this._showColliders;
    }

    set showColliders(value: boolean) {
        this._showColliders = value;
        if (!value) {
            this.graphics.clear();
        }
    }

    get showFPS(): boolean {
        return this._showFPS;
    }

    set showFPS(value: boolean) {
        this._showFPS = value;
        this.fpsText.visible = value;
        this.entityCountText.visible = value;
    }

    getContainer(): Container {
        return this.debugContainer;
    }

    getUIContainer(): Container {
        return this.uiContainer;
    }

    update(delta: number, entities: Entity[]): void {
        // Update FPS counter
        this.fpsText.visible = this._showFPS;
        if (this._showFPS) {
            this.fpsText.text = `FPS: ${Math.round(MainGame.instance.appPIXI.ticker.FPS)}`;
        }

        // Clear previous frame's debug graphics
        this.graphics.clear();

        // Draw colliders if enabled
        if (this._showColliders) {
            this.graphics.lineStyle(2, 0xff0000);
            this.graphics.beginFill(0xff0000, 0.2);

            for (const entity of entities) {
                const collider = entity.getComponent(Collider);
                const position = entity.getComponent(Position);

                if (collider && position) {
                    // Draw collider box in world space
                    this.graphics.drawRect(
                        position.x + collider.offsetX,
                        position.y + collider.offsetY,
                        collider.width,
                        collider.height
                    );
                }
            }

            this.graphics.endFill();
        }

        if (this.showHealth) {
            this.drawHealthBars(entities);
        }
    }

    private drawHealthBars(entities: Entity[]): void {
        for (const entity of entities) {
            const pos = entity.getComponent(Position);
            const health = entity.getComponent(Health);

            if (pos && health) {
                const healthPercent = health.getHealthPercentage();
                const barWidth = 50;
                const barHeight = 5;
                const x = pos.x - barWidth / 2;
                const y = pos.y - 30;

                // Background
                this.graphics.lineStyle(1, 0x000000);
                this.graphics.beginFill(0x000000);
                this.graphics.drawRect(x, y, barWidth, barHeight);
                this.graphics.endFill();

                // Health bar
                this.graphics.lineStyle(0);
                this.graphics.beginFill(healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000);
                this.graphics.drawRect(x, y, barWidth * healthPercent, barHeight);
                this.graphics.endFill();
            }
        }
    }
} 
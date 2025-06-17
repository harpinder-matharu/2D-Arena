import { World } from "./base/world";
import { MovementSystem } from './systems/movementSystem';
import { FiringSystem } from './systems/firingSystem';
import { RenderSystem } from './systems/renderSystem';
import { BulletSystem } from "./systems/bulletSystem";
import { Container } from "pixi.js";
import MainGame from "../mainGame";
import Map from "./map";
import { createPlayerEntity } from "./entities/playerEntity";
import { Entity } from "./base/entity";
import { Collider } from "./components/collider";
import { Position } from "./components/position";
import { CollisionSystem } from "./systems/collisionSystem";
import { createEnemyEntity } from "./entities/enemyEntity";
import { PlayerControlSystem } from "./systems/playerControlSystem";
import { GameStateSystem } from "./systems/gameStateSystem";
import { DebugSystem } from "./systems/debugSystem";
import { AISystem } from "./systems/aiSystem";
import { StatusEffectSystem } from "./systems/statusEffectSystem";
import { BoundarySystem } from "./systems/boundarySystem";

export default class ArenaWord extends World {
    mainContainer: Container;
    mainGame: MainGame;
    map: Map;
    debugSystem: DebugSystem;
    gameStateSystem: GameStateSystem;

    readonly timeToEndMatch: number = 60 * 20.1; // 20min match
    
    currentTimer: number = 0;
    tmpSteepTimer: number = 0;

    mapIndex: number = 1;

    constructor(mainGame: MainGame) {
        super();
        this.mainGame = mainGame;
        // Add Systems
        this.mainContainer = new Container();
        this.mainContainer.sortableChildren = true; // Enable z-index sorting
        this.map = new Map(this.mainContainer, this.mapIndex);
    }

    async init() {
        const mapData = await this.map.init();
        this.bound = this.map.getBound();
        const mapScale = 100 * this.map.scale.x;
        mapData.colliders.forEach(colliderData => {
            const entity = new Entity();
            // Position is the center of the platform
            const width = colliderData.z * mapScale;
            const height = colliderData.w * mapScale;
            const pos = new Position(
                entity.id, 
                colliderData.x * mapScale,
                -colliderData.y * mapScale
            );
            const collider = new Collider(
                entity.id,
                width,
                height,
                -width/2,  // Center the collider horizontally
                -height/2  // Center the collider vertically
            );
        
            entity.addComponent(pos);
            entity.addComponent(collider);
            this.addEntity(entity);
        });

        this.addSystem(new MovementSystem(this));
        this.addSystem(new RenderSystem(this, this.mainContainer));
        this.addSystem(new BulletSystem(this));
        this.addSystem(new FiringSystem(this));
        this.addSystem(new CollisionSystem(this));
        this.addSystem(new PlayerControlSystem(this));
        this.addSystem(new BoundarySystem(this));

        // Add new systems
        this.gameStateSystem = new GameStateSystem(this, this.mainGame);
        this.addSystem(this.gameStateSystem);

        this.debugSystem = new DebugSystem(this);
        this.addSystem(this.debugSystem);
        this.mainContainer.addChild(this.debugSystem.getContainer()); // Add world-space debug graphics to main container
        this.mainGame.appPIXI.stage.addChild(this.debugSystem.getUIContainer()); // Keep UI elements on stage

        this.addSystem(new AISystem(this));
        this.addSystem(new StatusEffectSystem());

        // Create entities
        const player = await createPlayerEntity();
        this.addEntity(player);

        // Create enemy entities
        for (let i = 0; i < 10; i++) {
            const enemy = await createEnemyEntity();
            this.addEntity(enemy);
        }

        this.currentTimer = this.timeToEndMatch;
        this.mainGame.onResizeHandlers.push(() => {
            this.reposition();
        }); 
        this.reposition();
    }

    override update(delta: number): void {
        super.update(delta);
        this.updateTimer(delta);
    }

    updateTimer(delta: number): void {
        if (this.currentTimer > 0) {
            this.currentTimer -= delta;
            if (this.currentTimer <= 0) {
                this.currentTimer = 0;
                this.mainGame.gameLose();
            }
        }
    }

    reposition() {
        this.mainContainer.x = (this.mainGame.screenWidth) / 2;
        this.mainContainer.y = (this.mainGame.screenHeight) / 2;
    }
}
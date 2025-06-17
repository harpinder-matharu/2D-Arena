import { System } from '../base/system';
import { Entity } from '../base/entity';
import { World } from '../base/world';
import MainGame from '../../mainGame';
import { PlayerControlled } from '../components/playerControlled';
import { Team } from '../components/team';

export enum GameState {
    LOADING = 'loading',
    MENU = 'menu',
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'game_over',
    VICTORY = 'victory'
}

export class GameStateSystem extends System {
    private currentState: GameState = GameState.LOADING;
    private stateStartTime: number = 0;
    private stateDuration: number = 0;
    private nextState?: GameState;

    constructor(private world: World, private mainGame: MainGame) {
        super(0); // Highest priority
    }

    update(delta: number, entities: Entity[]): void {
        const now = Date.now() / 1000;
        
        // Handle state transitions
        if (this.nextState && now - this.stateStartTime >= this.stateDuration) {
            this.transitionTo(this.nextState);
            this.nextState = undefined;
        }

        // Update current state
        switch (this.currentState) {
            case GameState.LOADING:
                this.updateLoading(delta);
                break;
            case GameState.MENU:
                this.updateMenu(delta);
                break;
            case GameState.PLAYING:
                this.updatePlaying(delta, entities);
                break;
            case GameState.PAUSED:
                this.updatePaused(delta);
                break;
            case GameState.GAME_OVER:
                this.updateGameOver(delta);
                break;
            case GameState.VICTORY:
                this.updateVictory(delta);
                break;
        }
    }

    private updateLoading(delta: number): void {
        // Check if all resources are loaded
        if (this.mainGame.appPIXI.stage.children.length > 0) {
            this.transitionTo(GameState.MENU);
        }
    }

    private updateMenu(delta: number): void {
        // Handle menu interactions
    }

    private updatePlaying(delta: number, entities: Entity[]): void {
        // Check win/lose conditions
        const player = entities.find(e => e.getComponent(PlayerControlled));
        if (!player) {
            this.transitionTo(GameState.GAME_OVER);
            return;
        }

        const enemies = entities.filter(e => e.getComponent(Team) && !e.getComponent(PlayerControlled));
        if (enemies.length === 0) {
            this.transitionTo(GameState.VICTORY);
            return;
        }
    }

    private updatePaused(delta: number): void {
        // Handle pause menu interactions
    }

    private updateGameOver(delta: number): void {
        // Handle game over screen interactions
    }

    private updateVictory(delta: number): void {
        // Handle victory screen interactions
    }

    transitionTo(newState: GameState, duration: number = 0): void {
        if (duration > 0) {
            this.nextState = newState;
            this.stateDuration = duration;
            this.stateStartTime = Date.now() / 1000;
        } else {
            this.currentState = newState;
            this.stateStartTime = Date.now() / 1000;
            this.stateDuration = 0;
            this.nextState = undefined;
        }

        // Handle state-specific setup
        switch (newState) {
            case GameState.PLAYING:
                this.mainGame.gameCanUpdate = true;
                break;
            case GameState.PAUSED:
                this.mainGame.gameCanUpdate = false;
                break;
            case GameState.GAME_OVER:
                this.mainGame.gameCanUpdate = false;
                this.mainGame.gameLose();
                break;
            case GameState.VICTORY:
                this.mainGame.gameCanUpdate = false;
                this.mainGame.gameWin();
                break;
        }
    }

    getCurrentState(): GameState {
        return this.currentState;
    }

    isState(state: GameState): boolean {
        return this.currentState === state;
    }
} 
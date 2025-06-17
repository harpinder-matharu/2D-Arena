import { Application, Assets, Point } from "pixi.js";
import Sounds from "./sounds";
import ParticleFXManager from "./effect/particleFxManager";
import UiGame from "./ui/uiGame";
import ArenaWord from "./ecs/arenaWord";

type ResizeHandler = () => void;

export default class MainGame {
    private static _instance: MainGame;
    static get instance(): MainGame {
        if (!MainGame._instance) {
            MainGame._instance = new MainGame();
        }
        return MainGame._instance;
    }

    appPIXI: Application;
    arenaWorld:ArenaWord;

    gameStart: boolean;
    gameCanUpdate: boolean = false;

    onResizeHandlers: ResizeHandler[] = [];
    screenScaleNeedUpdate: boolean = true;
    
    isZooming: boolean;
    screenWidth: number;
    screenHeight: number;
    private screenScale: number;
    screenCenterX: number;
    screenCenterY: number;

    effectManager: ParticleFXManager;

    mouseDownPosition: Point = new Point();
    isMouseDown: boolean;
    isMouseDrag: boolean;

    uiGame: UiGame;
    score: number = 0;

    startTime: number;

    constructor() {
        MainGame._instance = this;
        this.setup();
    }

    async setup(): Promise<void> {
        this.appPIXI = new Application();
        globalThis.__PIXI_APP__ = this.appPIXI;

        await this.appPIXI.init({ background: '#CBCBCB', resizeTo: window , antialias : true});

        // Optional: Make canvas fill the whole screen visually
        this.appPIXI.canvas.style.position = "absolute";
        this.appPIXI.canvas.style.top = "0";
        this.appPIXI.canvas.style.left = "0";
        this.gameWindowResize();
        // Enable interaction on the whole stage
        this.appPIXI.stage.eventMode = 'static';
        this.appPIXI.stage.hitArea = this.appPIXI.screen; // make sure it captures pointer events

        document.body.appendChild(this.appPIXI.canvas);

        // Load only the required sprite sheets for animations
        // await Assets.load("./images/images.json");
        // await Assets.load("./images/policeAndTerrorist.json");
        // await Assets.load("./images/levelSprites.json");

        // Load bullet texture
        const bulletTexture = await Assets.load("./images/bullet.png");
        Assets.cache.set("bullet", bulletTexture);

        this.effectManager = new ParticleFXManager(this.appPIXI);

        Sounds.init();
        await this.startLevel();
        this.uiGame = new UiGame();

        window.addEventListener('resize', this.gameWindowResize.bind(this));

        const resize = () => {
            if (!this.isZooming) {
                window.scrollTo(0, 0);
                document.body.style.width = document.documentElement.style.width = window.innerWidth + 'px';
                document.body.style.height = document.documentElement.style.height = window.innerHeight + 'px';
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // [iOS] Fix initial resizing not going well
        setTimeout(() => {
            resize();
        }, 4000);

        this.touchAndInputEven();
        this.appPIXI.ticker.add(delta => this.loop(delta.deltaTime));
    }

    async startLevel(): Promise<void> {
        // ECS World
        this.arenaWorld = new ArenaWord(this);
        await this.arenaWorld.init();
        this.startTime = performance.now();
        this.appPIXI.stage.addChild(this.arenaWorld.mainContainer);
        this.gameCanUpdate = true;
    }

    gameWin() {
        if (this.gameStart) {
            function calculateScore(time) {
                const baseScore = 300;
                const timePenalty = Math.floor(time * 0.5); // 10 points lost per second
                const finalScore = Math.max(baseScore - timePenalty, 0);
                return finalScore;
            }

            const endTime = performance.now();
            const timeTaken = (endTime - this.startTime) / 1000; // in seconds
            const scoreToadd = calculateScore(timeTaken) + (Math.floor(Math.random() * 5) + 1);

            this.effectManager.createWinEffect();
            this.gameStart = false;
            this.gameCanUpdate = false;
        }
    }
    gameLose() {
        if (this.gameStart) {
            this.gameStart = false;
            this.gameCanUpdate = false;
        }
    }

    collectGoldBlock(position: Point) {
        this.effectManager.createStartEffect(position, 25);
    }

    collectSticker(position: Point) {
        //this.winEffect.createGlowEffect(position, color, 10);
        this.effectManager.createStartEffect(position, 15);
        this.score++;
    }

    resetLevel() {
        console.log("reset Level");
        if (!this.gameStart) {
            this.startLevel();
        }
    }
    revireLevel() {
        console.log("revive Level");
        if (!this.gameStart) {
            this.gameCanUpdate = true;
        }
    }
    touchAndInputEven() {
        this.appPIXI.stage.on('pointerdown', (event) => {
            this.isMouseDrag = false;
            if (this.gameCanUpdate) {
                if (!this.gameStart) {
                    this.gameStart = true;
                    Sounds.playBgMusic();
                }

                this.isMouseDown = true;
                this.mouseDownPosition.copyFrom(event.global);
            }
        });

        this.appPIXI.stage.on('pointerup', (event) => {
            if (this.isMouseDown) {
                this.isMouseDown = false;
            }
            this.isMouseDrag = false;
        });
        this.appPIXI.stage.on('pointerupoutside', () => {
            this.isMouseDown = false;
            this.isMouseDrag = false;
            this.isZooming = false;
        });
        this.appPIXI.stage.on('pointermove', (event) => {
            if (this.isMouseDown) {
            }
        });

        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener("wheel", (event: WheelEvent) => {
            // Prevent the page from scrolling
            event.preventDefault();
            // Zoom direction
            const delta = Math.sign(event.deltaY);
        }, { passive: false });

        window.addEventListener('keydown', ev => {
            if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
                ev.preventDefault();
            }
        });

        let initialDistance = 0;
        let initialScale = 1;

        window.addEventListener("touchstart", (e: TouchEvent) => {
            if (e.touches.length === 2) {
                initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
                //initialScale = this.levelManager.localScale; // Assuming uniform scaling
                this.isZooming = true;
            }
        }, { passive: false });

        window.addEventListener("touchmove", (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
                const scaleFactor = currentDistance / initialDistance;
                let newScale = initialScale * scaleFactor;
            }
        }, { passive: false });

        window.addEventListener("touchend", () => {
            // Reset zooming state when touch ends
            this.isZooming = false;
        });

        window.addEventListener("touchcancel", () => {
            // Reset zooming state when touch is canceled
            this.isZooming = false;
        });

        function getTouchDistance(touch1: Touch, touch2: Touch): number {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }

    loop(deltaTime) {
        if (this.gameCanUpdate) {
            const deltaSeconds = deltaTime / 60;
            this.arenaWorld.update(deltaSeconds);
        }
        this.effectManager.update(deltaTime);
    }
    handleVisibilityChange() {
        if (document.hidden) {
            Sounds.stopBgMusic();
        }
        else {
            Sounds.playBgMusic();
        }
    }
    gameWindowResize(): void {
        this.screenScaleNeedUpdate = true;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.screenCenterX = this.screenWidth / 2;
        this.screenCenterY = this.screenHeight / 2;
        for (const handler of this.onResizeHandlers) {
            handler();
        }
    }
    getScale(): number {
        if (this.screenScaleNeedUpdate) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const baseWidth = 1080;
            const baseHeight = 1500; // Assuming 16:9 aspect ratio, adjust if needed

            const scaleX = screenWidth / baseWidth;
            const scaleY = screenHeight / baseHeight;

            this.screenScale = Math.min(scaleX, scaleY);
            this.screenScaleNeedUpdate = false;
        }
        return this.screenScale;
    }
}

new MainGame();
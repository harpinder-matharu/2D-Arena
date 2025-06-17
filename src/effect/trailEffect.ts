import { MeshRope, Point, Texture } from "pixi.js";

export default class TrailEffect{
    _historyX: number[] = [];
    _historyY: number[] = [];
    _historySize: number = 10;
    _ropeSize: number = 20;
    _points: Point[] = [];
    _mousePosition: Point;
    _isMousePositionMove: boolean

    ropeTrail:MeshRope;
    lastUpdateTime: number;

    constructor() {
        // Create history array.
        for (let i = 0; i < this._historySize; i++) {
            this._historyX.push(0);

            this._historyY.push(0);
        }
        // Create rope points.
        for (let i = 0; i < this._ropeSize; i++) {
            this._points.push(new Point(0, 0));
        }

        const trailTexture = this.createTexture(0, 8, 2);
        // Create the rope
        this.ropeTrail = new MeshRope({
            texture: trailTexture,
            points: this._points,
        });
        this.ropeTrail.interactive = false;
        this._mousePosition = new Point();
    }

    moveMouse(global: Point) {
        this._isMousePositionMove = true;
        this._mousePosition.x = global.x;
        this._mousePosition.y = global.y;
    }

    moveMouseXY(x: number, y:number) {
        this._isMousePositionMove = true;
        this._mousePosition.x = x;
        this._mousePosition.y = y;
    }

    clear(x:number,y:number){
        this._isMousePositionMove = false;
        this._historyX.fill(x);
        this._historyY.fill(y);
        for (let i = 0; i < this._ropeSize; i++) {
            this._points[i].x = x;
            this._points[i].y = y;
        }
        this.lastUpdateTime = 0;
    }

    update() {
        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime); 
        
        if (this._isMousePositionMove && deltaTime > 40) {
            this.lastUpdateTime = now;
            // Update the mouse values to history
            this._historyX.pop();
            this._historyX.unshift(this._mousePosition.x);
            this._historyY.pop();
            this._historyY.unshift(this._mousePosition.y);
            // Update the points to correspond with history.
            for (let i = 0; i < this._ropeSize; i++) {
                const p = this._points[i];

                // Smooth the curve with cubic interpolation to prevent sharp edges.
                const ix = this.cubicInterpolation(this._historyX, (i / this._ropeSize) * this._historySize);
                const iy = this.cubicInterpolation(this._historyY, (i / this._ropeSize) * this._historySize);

                p.x = ix;
                p.y = iy;
            }
        }
    }

    clipInput(k, arr) {
        if (k < 0) k = 0;
        if (k > arr.length - 1) k = arr.length - 1;

        return arr[k];
    }

    getTangent(k, factor, array) {
        return (factor * (this.clipInput(k + 1, array) - this.clipInput(k - 1, array))) / 2;
    }

    cubicInterpolation(array, t, tangentFactor = 1) {
        const k = Math.floor(t);
        const m = [this.getTangent(k, tangentFactor, array), this.getTangent(k + 1, tangentFactor, array)];
        const p = [this.clipInput(k, array), this.clipInput(k + 1, array)];

        t -= k;
        const t2 = t * t;
        const t3 = t * t2;

        return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
    }

    createTexture(r1, r2, resolution): Texture {
        const radiusOuter = (r2 + 1) * resolution;
        const size = radiusOuter * 2;

        // Create a canvas
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d")!;

        // const gradient = ctx.createLinearGradient(
        //     0, size * 0.5,         // Start point (x0, y0)
        //     size, size * 0.5    // End point (x1, y1)
        // );

        const gradient = ctx.createRadialGradient(
            0, size * 0.5, size*0.5, // Start circle (center and radius)
            size, size * 0.5, 0  // End circle (same center, larger radius)
        );

        gradient.addColorStop(0, "rgb(114, 114, 114)");
        gradient.addColorStop(1, "rgba(167, 130, 201, 0)");

        // Fill the canvas with the gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Create a PIXI texture from the canvas
        return Texture.from(canvas);
    }
}
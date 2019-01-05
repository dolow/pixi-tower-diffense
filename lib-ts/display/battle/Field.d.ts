import * as PIXI from 'pixi.js';
export default class Field extends PIXI.Container {
    private static resourceListCache;
    private pointerDownCount;
    private lastPointerPositionX;
    private foregroundScrollLimit;
    private containers;
    static readonly resourceList: string[];
    constructor();
    init(): void;
    private onPointerDown;
    private onPointerMove;
    private onPointerUp;
}

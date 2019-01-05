import * as PIXI from 'pixi.js';
export default class Field extends PIXI.Container {
    private static resourceListCache;
    private pointerDownCount;
    private lastPointerPositionX;
    private foregroundScrollLimit;
    private containers;
    private foreZLines;
    private lastAddedZLineIndex;
    static readonly resourceList: string[];
    constructor();
    init(zLines?: number): void;
    addChildToRandomZLine(container: PIXI.Container): void;
    private onPointerDown;
    private onPointerMove;
    private onPointerUp;
}

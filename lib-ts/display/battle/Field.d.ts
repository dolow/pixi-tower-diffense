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
    init(options?: any): void;
    addChildAsForeBackgroundEffect(container: PIXI.Container): void;
    addChildAsForeForegroundEffect(container: PIXI.Container): void;
    addChildToRandomZLine(container: PIXI.Container): void;
    private onPointerDown;
    private onPointerMove;
    private onPointerUp;
}

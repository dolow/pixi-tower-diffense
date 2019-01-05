import * as PIXI from 'pixi.js';
export default class Dead extends PIXI.Container {
    private static resourceListCache;
    private bucket;
    private spirit;
    private elapsedFrameCount;
    static readonly resourceList: string[];
    constructor(flip: boolean);
    update(_delta: number): void;
}

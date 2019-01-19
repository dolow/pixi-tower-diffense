import * as PIXI from 'pixi.js';
import UpdateObject from 'display/UpdateObject';
export default class Dead extends PIXI.Container implements UpdateObject {
    private static resourceListCache;
    private bucket;
    private spirit;
    private elapsedFrameCount;
    static readonly resourceList: string[];
    constructor(flip: boolean);
    isDestroyed(): boolean;
    update(_delta: number): void;
}

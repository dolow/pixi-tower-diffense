import * as PIXI from 'pixi.js';
import UpdateObject from 'display/UpdateObject';
export default class AttackSmokeEffect extends PIXI.Container implements UpdateObject {
    private elapsedFrameCount;
    private sprite;
    static readonly resourceList: string[];
    constructor();
    isDestroyed(): boolean;
    update(_delta: number): void;
}

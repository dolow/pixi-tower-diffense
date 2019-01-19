import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';
export default class BattleResult extends PIXI.Container implements UpdateObject {
    animationEnded: boolean;
    onAnimationEnded: () => void;
    private sprite;
    static readonly resourceList: string[];
    constructor(win: boolean);
    isDestroyed(): boolean;
    update(_delta: number): void;
}

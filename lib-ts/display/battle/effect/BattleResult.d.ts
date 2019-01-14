import * as PIXI from 'pixi.js';
export default class BattleResult extends PIXI.Container {
    animationEnded: boolean;
    onAnimationEnded: () => void;
    private result;
    static readonly resourceList: string[];
    constructor(win: boolean);
    update(_delta: number): void;
}

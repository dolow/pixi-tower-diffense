import * as PIXI from 'pixi.js';
import UnitMaster from 'interfaces/master/Unit';
import UnitEntity from 'entity/UnitEntity';
/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends UnitEntity {
    /**
     * PIXI スプライト
     */
    sprite: PIXI.Sprite;
    /**
     * 現在のアニメーション種別
     */
    protected animationType: string;
    /**
     * 現在のアニメーションフレーム
     */
    protected animationFrameIndex: number;
    /**
     * 現在のアニメーション経過フレーム数
     */
    protected elapsedFrameCount: number;
    isHitFrame(): boolean;
    readonly unitId: number;
    readonly cost: number;
    readonly maxHealth: number;
    readonly power: number;
    readonly speed: number;
    readonly wieldFrames: number;
    readonly hitFrame: number;
    isAnimationLastFrameTime(type?: string): boolean;
    getAnimationType(): string;
    getAnimationMaxFrameIndex(type: string): number;
    getAnimationUpdateDuration(type: string): number;
    getAnimationMaxFrameTime(type: string): number;
    constructor(master: UnitMaster, isPlayer: boolean);
    isFoeContact(target: PIXI.Container): boolean;
    resetAnimation(): void;
    updateAnimation(type?: string): void;
}

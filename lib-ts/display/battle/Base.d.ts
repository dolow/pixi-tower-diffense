import * as PIXI from 'pixi.js';
import BaseMaster from 'interfaces/master/Base';
import BaseEntity from 'entity/BaseEntity';
/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Base extends BaseEntity {
    /**
     * PIXI スプライト
     */
    sprite: PIXI.Sprite;
    /**
     * 初期座標、アニメーションなどで更新されるため覚えておく
     */
    protected originalPositon: PIXI.Point;
    /**
     * 現在のアニメーション種別
     */
    protected animationType: string;
    /**
     * 現在の経過フレーム数
     */
    protected elapsedFrameCount: number;
    constructor(master: BaseMaster, isPlayer: boolean);
    init(options?: any): void;
    resetAnimation(): void;
    updateAnimation(type?: string): void;
}

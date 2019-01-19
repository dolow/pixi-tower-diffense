import * as PIXI from 'pixi.js';
import BaseEntity from 'entity/BaseEntity';
import UpdateObject from 'display/UpdateObject';
/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Base extends BaseEntity implements UpdateObject {
    /**
     * PIXI スプライト
     */
    sprite: PIXI.Sprite;
    /**
     * 爆発エフェクト用コンテナ
     */
    explodeContainer: PIXI.Container;
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
    static readonly resourceList: string[];
    constructor(baseId: number, isPlayer: boolean);
    isDestroyed(): boolean;
    update(_dt: number): void;
    init(options?: any): void;
    resetAnimation(): void;
    collapse(): void;
    spawn(): void;
    updateAnimation(type?: string): void;
    private spawnCollapseExplode;
}

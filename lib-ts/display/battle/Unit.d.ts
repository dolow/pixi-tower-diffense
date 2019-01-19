import * as PIXI from 'pixi.js';
import UnitEntity from 'entity/UnitEntity';
import UpdateObject from 'display/UpdateObject';
import HealthGauge from 'display/battle/effect/HealthGauge';
/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends UnitEntity implements UpdateObject {
    /**
     * PIXI スプライト
     */
    sprite: PIXI.Sprite;
    /**
     * スポーンした座標
     */
    protected spawnedPosition: PIXI.Point;
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
    /**
     * 当たり判定が発生するフレームインデックス
     * マスターデータの値
     */
    protected hitFrame: number;
    /**
     * 最大のフレームインデックス
     * マスターデータの値
     */
    protected animationMaxFrameIndexes: {
        [key: string]: number;
    };
    /**
     * フレーム更新に必要なrequestAnimationFrame数
     * マスターデータの値
     */
    protected animationUpdateDurations: {
        [key: string]: number;
    };
    protected healthGauge: HealthGauge | null;
    protected destroyed: boolean;
    constructor(unitId: number, isPlayer: boolean, animationParam: {
        hitFrame: number;
        animationMaxFrameIndexes: {
            [key: string]: number;
        };
        animationUpdateDurations: {
            [key: string]: number;
        };
    });
    isDestroyed(): boolean;
    update(_dt: number): void;
    saveSpawnedPosition(): PIXI.Point;
    isHitFrame(): boolean;
    isAnimationLastFrameTime(type?: string): boolean;
    getAnimationType(): string;
    spawnHealthGauge(fromPercent: number, toPercent: number): HealthGauge;
    isFoeContact(target: PIXI.Container): boolean;
    resetAnimation(): void;
    updateAnimation(type?: string): void;
    destroy(): void;
}

import * as PIXI from 'pixi.js';
import Attackable from 'display/battle/Attackable';
import HealthGauge from 'display/battle/single_shot/HealthGauge';
/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends Attackable {
    /**
     * ユニット ID
     */
    protected unitId: number;
    /**
     * スポーンした座標
     */
    protected spawnedPosition: PIXI.Point;
    /**
     * 現在のアニメーションフレーム
     */
    protected animationFrameIndex: number;
    /**
     * 再生をリクエストされたアニメーション種別
     */
    protected requestedAnimation: string | null;
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
    /**
     * HealthGauge インスタンス
     * Unit で管理する
     */
    protected healthGauge: HealthGauge | null;
    /**
     * コンストラクタ
     */
    constructor(unitId: number, animationParam: {
        hitFrame: number;
        spawnPosition: {
            x: number;
            y: number;
        };
        animationMaxFrameIndexes: {
            [key: string]: number;
        };
        animationUpdateDurations: {
            [key: string]: number;
        };
    });
    /**
     * アニメーション再生をリセットする
     */
    resetAnimation(): void;
    /**
     * UpdateObject インターフェース実装
     * requestAnimationFrame 毎のアップデート処理
     */
    update(_dt: number): void;
    /**
     * 人師種別のアニメーションの再生をリクエストする
     * リクエストされたアニメーションは再生可能になり次第再生される
     */
    requestAnimation(type: string): void;
    /**
     * spawnedPosition を返す
     */
    getSpawnedPosition(): PIXI.Point;
    /**
     * 現在のアニメーションフレームのインデックスが当たり判定の発生するインデックスかどうかを返す
     */
    isHitFrame(): boolean;
    /**
     * 現在のアニメーションが終了するフレーム時間かどうかを返す
     */
    isAnimationLastFrameTime(type?: string): boolean;
    /**
     * HealthGauge インスタンスを生成し、座標を設定して返す
     */
    spawnHealthGauge(fromPercent: number, toPercent: number): HealthGauge;
    /**
     * アニメーションを更新する
     */
    updateAnimation(): void;
    /**
     * アニメーション遷移が可能であれば遷移する
     */
    private transformAnimationIfPossible;
}

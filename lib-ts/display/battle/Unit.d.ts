import * as PIXI from 'pixi.js';
import UnitEntity from 'entity/UnitEntity';
import UpdateObject from 'interfaces/UpdateObject';
import HealthGauge from 'display/battle/single_shot/HealthGauge';
/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends UnitEntity implements UpdateObject {
    /**
     * 表示する PIXI.Sprite インスタンス
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
     * 経過フレーム数
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
    /**
     * HealthGauge インスタンス
     * Unit で管理する
     */
    protected healthGauge: HealthGauge | null;
    /**
     * 破棄フラグ
     */
    protected destroyed: boolean;
    /**
     * コンストラクタ
     */
    constructor(unitId: number, isPlayer: boolean, animationParam: {
        hitFrame: number;
        animationMaxFrameIndexes: {
            [key: string]: number;
        };
        animationUpdateDurations: {
            [key: string]: number;
        };
    });
    /**
     * UpdateObject インターフェース実装
     * 削除フラグが立っているか返す
     */
    isDestroyed(): boolean;
    /**
     * UpdateObject インターフェース実装
     * requestAnimationFrame 毎のアップデート処理
     */
    update(_dt: number): void;
    /**
     * 現在の position を生成位置として保持する
     */
    saveSpawnedPosition(): PIXI.Point;
    /**
     * 現在のアニメーションフレームのインデックスが当たり判定の発生するインデックスかどうかを返す
     */
    isHitFrame(): boolean;
    /**
     * 現在のアニメーションが終了するフレーム時間かどうかを返す
     */
    isAnimationLastFrameTime(type?: string): boolean;
    /**
     * 現在のアニメーション種別を返す
     */
    getAnimationType(): string;
    /**
     * HealthGauge インスタンスを生成し、座標を設定して返す
     */
    spawnHealthGauge(fromPercent: number, toPercent: number): HealthGauge;
    /**
     * 接敵しているかどうかを返す
     */
    isFoeContact(target: PIXI.Container): boolean;
    /**
     * アニメーション時間をリセットする
     */
    resetAnimation(): void;
    /**
     * アニメーションを更新する
     */
    updateAnimation(): void;
    /**
     * このオブジェクトと子要素を破棄する
     */
    destroy(): void;
}

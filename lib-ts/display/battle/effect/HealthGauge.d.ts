import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';
/**
 * health 増減を表現するエフェクト
 */
export default class HealthGaugeEffect extends PIXI.Container implements UpdateObject {
    /**
     * ゲージの幅
     */
    gaugeWidth: number;
    /**
     * ゲージの高さ
     */
    gaugeHeight: number;
    /**
     * 最大 health の色
     */
    maxColor: number;
    /**
     * 現在の health の色
     */
    currentColor: number;
    /**
     * 枠線の色
     */
    lineColor: number;
    /**
     * 経過フレーム数
     */
    private elapsedFrameCount;
    /**
     * 減少アニメーションのフレーム数
     */
    private reducingFrameCount;
    /**
     * 表示するフレーム数
     */
    private activeFrameCount;
    /**
     * 最大 health 用の PIXI.Graphics
     */
    private maxGraphic;
    /**
     * 現在の health 用の PIXI.Graphics
     */
    private currentGraphic;
    /**
     * 減算元のゲージ比率
     */
    private fromPercent;
    /**
     * 減算後のゲージ比率
     */
    private toPercent;
    /**
     * このエフェクトで使用するリソースリスト
     */
    static readonly resourceList: string[];
    /**
     * コンストラクタ
     */
    constructor(fromPercent: number, toPercent: number);
    /**
     * UpdateObject インターフェース実装
     * 削除フラグが立っているか返す
     */
    isDestroyed(): boolean;
    /**
     * UpdateObject インターフェース実装
     * requestAnimationFrame 毎のアップデート処理
     */
    update(_delta: number): void;
}

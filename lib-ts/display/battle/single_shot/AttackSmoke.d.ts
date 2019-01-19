import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';
/**
 * 攻撃時のもくもくエフェクト
 */
export default class AttackSmokeEffect extends PIXI.Container implements UpdateObject {
    /**
     * スプライトアニメーションを更新する頻度
     */
    static readonly TextureFrameUpdateFrequency: number;
    /**
     * 経過フレーム数
     */
    private elapsedFrameCount;
    /**
     * 表示する PIXI.Sprite インスタンス
     */
    private sprite;
    /**
     * このエフェクトで使用するリソースリスト
     */
    static readonly resourceList: string[];
    /**
     * コンストラクタ
     */
    constructor();
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

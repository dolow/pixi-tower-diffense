import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';
/**
 * ゲーム結果を表現するエフェクト
 */
export default class BattleResult extends PIXI.Container implements UpdateObject {
    /**
     * アニメーション終了フラグ
     */
    animationEnded: boolean;
    /**
     * アニメーション終了時コールバック
     */
    onAnimationEnded: () => void;
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
    constructor(win: boolean);
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

import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';
/**
 * 死亡を表現するエフェクト
 */
export default class Dead extends PIXI.Container implements UpdateObject {
    /**
     * 経過フレーム数
     */
    private elapsedFrameCount;
    private bucket;
    private spirit;
    /**
     * このエフェクトで使用するリソースリスト
     */
    static readonly resourceList: string[];
    /**
     * コンストラクタ
     */
    constructor(flip: boolean);
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

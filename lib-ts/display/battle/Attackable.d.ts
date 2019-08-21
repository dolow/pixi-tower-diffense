import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';
/**
 * エンティティの振舞い、及び見た目に関する処理を行う
 */
export default abstract class Attackable implements UpdateObject {
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
    animationType: string;
    /**
     * 経過フレーム数
     */
    protected elapsedFrameCount: number;
    /**
     * 破棄フラグ
     */
    protected destroyed: boolean;
    /**
     * spawnedPosition を返す
     */
    readonly distanceBasePosition: PIXI.Point;
    constructor(spawnPosition: {
        x: number;
        y: number;
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

import * as PIXI from 'pixi.js';
import BaseEntity from 'entity/BaseEntity';
import UpdateObject from 'interfaces/UpdateObject';
/**
 * 拠点の振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Base extends BaseEntity implements UpdateObject {
    /**
     * 表示する PIXI.Sprite インスタンス
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
     * 経過フレーム数
     */
    protected elapsedFrameCount: number;
    /**
     * このクラスで利用するリソースリスト
     */
    static readonly resourceList: string[];
    /**
     * コンストラクタ
     */
    constructor(baseId: number, isPlayer: boolean);
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
     * 初期化処理
     * 主に座標周りを初期化する
     */
    init(options?: any): void;
    /**
     * アニメーションを初期化する
     */
    resetAnimation(): void;
    /**
     * 破壊状態にする
     */
    collapse(): void;
    /**
     * ユニット生成状態にする
     */
    spawn(): void;
    /**
     * アニメーションを更新する
     */
    updateAnimation(): void;
    /**
     * 破壊時の爆発を生成する
     */
    private spawnCollapseExplode;
}

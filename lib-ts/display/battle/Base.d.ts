import * as PIXI from 'pixi.js';
import Attackable from 'display/battle/Attackable';
/**
 * 拠点の振舞い、及び見た目に関する処理を行う
 * Attackable を継承する
 */
export default class Base extends Attackable {
    /**
     * 爆発エフェクト用コンテナ
     */
    explodeContainer: PIXI.Container;
    /**
     * 拠点 ID
     */
    protected baseId: number;
    /**
     * 初期座標、アニメーションなどで更新されるため覚えておく
     */
    protected originalPositon: PIXI.Point;
    /**
     * このクラスで利用するリソースリスト
     */
    static readonly resourceList: string[];
    /**
     * コンストラクタ
     */
    constructor(baseId: number);
    /**
     * UpdateObject インターフェース実装
     * requestAnimationFrame 毎のアップデート処理
     */
    update(_dt: number): void;
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
    spawn(playSe: boolean): void;
    /**
     * アニメーションを更新する
     */
    updateAnimation(): void;
    /**
     * 破壊時の爆発を生成する
     */
    private spawnCollapseExplode;
    /**
     * ユニット生成時の効果音を再生する
     */
    private playSpawnSe;
}

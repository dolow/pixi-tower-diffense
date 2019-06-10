import * as PIXI from 'pixi.js';
import Attackable from 'example/Attackable';
/**
 * 拠点の振舞い、及び見た目に関する処理を行う
 * Attackable を継承する
 */
export default class Castle extends Attackable {
    /**
     * 爆発エフェクト用コンテナ
     */
    explodeContainer: PIXI.Container;
    /**
     * 拠点 ID
     */
    protected castleId: number;
    /**
     * コンストラクタ
     */
    constructor(castleId: number, spawnPosition: {
        x: number;
        y: number;
    });
    /**
     * UpdateObject インターフェース実装
     * requestAnimationFrame 毎のアップデート処理
     */
    update(_dt: number): void;
    /**
     * アニメーションを更新する
     */
    updateAnimation(): void;
}

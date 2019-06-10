import * as PIXI from 'pixi.js';
/**
 * ユニット生成をリクエストするための UI 用のボタン
 */
export default class UnitButton extends PIXI.Container {
    /**
     * ボタン枠のインデックス
     */
    slotIndex: number;
    /**
     * ボタンに割り当てられたユニットの ID
     */
    unitId: number;
    /**
     * 表示するユニットコスト
     */
    cost: number;
    /**
     * ボタン画像
     */
    private button;
    /**
     * コストテキスト
     */
    private text;
    /**
     * フィルター
     */
    private filter;
    /**
     * コンストラクタ
     */
    constructor(texture?: PIXI.Texture);
    /**
     * ボタン枠インデックスとユニット ID で初期化する
     */
    init(slotIndex: number, unitId?: number, cost?: number): void;
    /**
     * ColorMatrixFilter の有効/無効を切り替える
     */
    toggleFilter(enabled: boolean): void;
    /**
     * ユニットを変更する
     */
    changeUnit(unitId?: number, cost?: number): void;
    /**
     * 指定したユニット ID のテクスチャを変更する
     */
    private getTexture;
}

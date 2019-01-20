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
    constructor(texture?: PIXI.Texture);
    /**
     * ボタン枠インデックスとユニット ID で初期化する
     */
    init(slotIndex: number, unitId?: number, cost?: number): void;
    changeUnit(unitId?: number, cost?: number): void;
    private getTexture;
}

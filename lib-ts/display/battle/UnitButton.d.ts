import * as PIXI from 'pixi.js';
/**
 * ユニット生成をリクエストするための UI 用のボタン
 */
export default class UnitButton extends PIXI.Sprite {
    /**
     * ボタン枠のインデックス
     */
    slotIndex: number;
    /**
     * ボタンに割り当てられたユニットの ID
     */
    unitId: number;
    /**
     * ボタン枠インデックスとユニット ID で初期化する
     */
    init(slotIndex: number, unitId: number): void;
}

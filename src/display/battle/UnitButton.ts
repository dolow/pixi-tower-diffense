import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';

/**
 * ユニット生成をリクエストするための UI 用のボタン
 */
export default class UnitButton extends PIXI.Sprite {
  /**
   * ボタン枠のインデックス
   */
  public slotIndex: number = -1;
  /**
   * ボタンに割り当てられたユニットの ID
   */
  public unitId: number = -1;

  /**
   * ボタン枠インデックスとユニット ID で初期化する
   */
  public init(slotIndex: number, unitId: number): void {
    const resourceId = ResourceMaster.Dynamic.UnitPanel(unitId >= 0 ? unitId : undefined);
    const texture = PIXI.loader.resources[resourceId].texture;
    if (!texture) {
      return;
    }

    this.slotIndex = slotIndex;
    this.unitId    = unitId;
    this.texture   = texture;
  }
}

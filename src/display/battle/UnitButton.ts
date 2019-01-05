import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';

export default class UnitButton extends PIXI.Sprite {
  public slotIndex: number = -1;
  public unitId:    number = -1;

  public init(slotIndex: number, unitId: number): void {
    const resourceId = ResourceMaster.UnitPanelTexture(unitId);
    const texture = PIXI.loader.resources[resourceId].texture;
    if (!texture) {
      return;
    }

    this.slotIndex = slotIndex;
    this.unitId    = unitId;
    this.texture   = texture;
  }
}

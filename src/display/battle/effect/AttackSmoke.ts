import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import UpdateObject from 'display/UpdateObject';

export default class AttackSmokeEffect extends UpdateObject {
  private elapsedFrameCount: number = 0;
  private sprite!: PIXI.Sprite;

  public static get resourceList(): string[] {
    return [ResourceMaster.AttackSmoke.Api()];
  }

  constructor() {
    super();

    this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache[ResourceMaster.AttackSmoke.TextureFrameName(1)]);
    this.addChild(this.sprite);
  }

  public update(_delta: number): void {
    this.elapsedFrameCount++;

    this.sprite.visible = (this.elapsedFrameCount % 2 === 0);

    if (this.elapsedFrameCount % 4 === 0) {
      const index = Math.floor(this.elapsedFrameCount / 4) + 1;
      if (index > ResourceMaster.AttackSmoke.MaxFrameIndex) {
        this.sprite.destroy();
        this.destroy();
        return;
      }

      this.sprite.texture = PIXI.utils.TextureCache[ResourceMaster.AttackSmoke.TextureFrameName(index)];
    }
  }
}

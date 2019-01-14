import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';

export default class CollapseExplodeEffect extends PIXI.Sprite {
  private elapsedFrameCount: number = 0;

  public static get resourceList(): string[] {
    return [ResourceMaster.CollapseExplode.Api()];
  }

  constructor() {
    super(PIXI.utils.TextureCache[ResourceMaster.CollapseExplode.TextureFrameName(1)]);
  }

  public update(_delta: number): void {
    this.elapsedFrameCount++;

    if (this.elapsedFrameCount % 4 === 0) {
      const index = Math.floor(this.elapsedFrameCount / 4) + 1;
      if (index > ResourceMaster.CollapseExplode.MaxFrameIndex) {
        this.destroy();
        return;
      }

      this.texture = PIXI.utils.TextureCache[ResourceMaster.CollapseExplode.TextureFrameName(index)];
    }
  }
}

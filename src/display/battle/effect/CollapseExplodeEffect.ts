import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import SoundManager from 'managers/SoundManager';
import UpdateObject from 'display/UpdateObject';

export default class CollapseExplodeEffect extends UpdateObject {
  private elapsedFrameCount: number = 0;
  private sprite!: PIXI.Sprite;

  public static get resourceList(): string[] {
    return [
      ResourceMaster.CollapseExplode.Api(),
      ResourceMaster.Audio.Se.Bomb
    ];
  }

  constructor() {
    super();
    this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache[ResourceMaster.CollapseExplode.TextureFrameName(1)]);
    this.sprite.anchor.set(0.5, 0.5);
    this.addChild(this.sprite);
  }

  public update(_delta: number): void {
    this.elapsedFrameCount++;

    this.sprite.visible = (this.elapsedFrameCount % 2 === 0);

    if (this.elapsedFrameCount === 1) {
      const sound = SoundManager.instance.getSound(ResourceMaster.Audio.Se.Bomb);
      if (sound) {
        sound.play();
      }
    }

    if (this.elapsedFrameCount % 4 === 0) {
      const index = Math.floor(this.elapsedFrameCount / 4) + 1;
      if (index > ResourceMaster.CollapseExplode.MaxFrameIndex) {
        this.sprite.destroy();
        this.destroy();
        return;
      }

      this.sprite.texture = PIXI.utils.TextureCache[ResourceMaster.CollapseExplode.TextureFrameName(index)];
    }
  }
}

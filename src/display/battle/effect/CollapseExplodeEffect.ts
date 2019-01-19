import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import SoundManager from 'managers/SoundManager';
import UpdateObject from 'interfaces/UpdateObject';

export default class CollapseExplodeEffect extends PIXI.Container implements UpdateObject {
  private elapsedFrameCount: number = 0;
  private sprite!: PIXI.Sprite;

  public static get resourceList(): string[] {
    return [
      ResourceMaster.Static.CollapseExplode,
      ResourceMaster.Audio.Se.Bomb
    ];
  }

  constructor() {
    super();
    this.sprite = new PIXI.Sprite(ResourceMaster.TextureFrame.CollapseExplode(1));
    this.sprite.anchor.set(0.5, 0.5);
    this.addChild(this.sprite);
  }

  public isDestroyed(): boolean {
    return this._destroyed;
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
      if (index > ResourceMaster.MaxFrameIndex(ResourceMaster.Static.CollapseExplode)) {
        this.sprite.destroy();
        this.destroy();
        return;
      }

      this.sprite.texture = ResourceMaster.TextureFrame.CollapseExplode(index);
    }
  }
}

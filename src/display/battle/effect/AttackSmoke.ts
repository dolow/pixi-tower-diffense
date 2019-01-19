import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import UpdateObject from 'interfaces/UpdateObject';

export default class AttackSmokeEffect extends PIXI.Container implements UpdateObject {
  private elapsedFrameCount: number = 0;
  private sprite!: PIXI.Sprite;

  public static get resourceList(): string[] {
    return [ResourceMaster.Static.AttackSmoke];
  }

  constructor() {
    super();

    this.sprite = new PIXI.Sprite(ResourceMaster.TextureFrame.AttackSmoke(1));
    this.addChild(this.sprite);
  }

  public isDestroyed(): boolean {
    return this._destroyed;
  }

  public update(_delta: number): void {
    this.elapsedFrameCount++;

    this.sprite.visible = (this.elapsedFrameCount % 2 === 0);

    if (this.elapsedFrameCount % 4 === 0) {
      const index = Math.floor(this.elapsedFrameCount / 4) + 1;
      if (index > ResourceMaster.MaxFrameIndex(ResourceMaster.Static.AttackSmoke)) {
        this.sprite.destroy();
        this.destroy();
        return;
      }

      this.sprite.texture = ResourceMaster.TextureFrame.AttackSmoke(index);
    }
  }
}

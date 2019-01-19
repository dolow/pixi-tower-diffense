import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import UpdateObject from 'display/UpdateObject';
import GameManager from 'managers/GameManager';

export default class BattleResult extends PIXI.Container implements UpdateObject {
  public animationEnded: boolean = false;

  public onAnimationEnded: () => void = () => {};

  private sprite!: PIXI.Sprite;

  public static get resourceList(): string[] {
    return [
      ResourceMaster.Static.BattleResultWin,
      ResourceMaster.Static.BattleResultLose
    ];
  }

  constructor(win: boolean) {
    super();

    const textureCacheName = (win)
      ? ResourceMaster.Static.BattleResultWin
      : ResourceMaster.Static.BattleResultLose;
    const texture = PIXI.utils.TextureCache[textureCacheName];

    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5);

    this.sprite.position.x = GameManager.instance.game.view.width * 0.5;
    this.sprite.position.y = -(this.sprite.height * 0.5);

    this.addChild(this.sprite);
  }

  public isDestroyed(): boolean {
    return this._destroyed;
  }

  public update(_delta: number): void {
    if (this.animationEnded) {
      return;
    }

    this.sprite.position.y += 4;

    if (this.sprite.position.y >= GameManager.instance.game.view.height * 0.5) {
      this.animationEnded = true;
      this.onAnimationEnded();
    }
  }
}

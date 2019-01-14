import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import GameManager from 'managers/GameManager';

export default class BattleResult extends PIXI.Container {
  public animationEnded: boolean = false;

  public onAnimationEnded: () => void = () => {};

  private result!: PIXI.Sprite;

  public static get resourceList(): string[] {
    return [
      ResourceMaster.BattleResult.Win.Api(),
      ResourceMaster.BattleResult.Lose.Api()
    ];
  }

  constructor(win: boolean) {
    super();

    const textureCacheName = (win)
      ? ResourceMaster.BattleResult.Win.Api()
      : ResourceMaster.BattleResult.Lose.Api();
    const texture = PIXI.utils.TextureCache[textureCacheName];

    this.result = new PIXI.Sprite(texture);
    this.result.anchor.set(0.5);

    this.result.position.x = GameManager.instance.game.view.width * 0.5;
    this.result.position.y = -(this.result.height * 0.5);

    this.addChild(this.result);
  }

  public update(_delta: number): void {
    if (this.animationEnded) {
      return;
    }

    this.result.position.y += 4;

    if (this.result.position.y >= GameManager.instance.game.view.height * 0.5) {
      this.animationEnded = true;
      this.onAnimationEnded();
    }
  }
}

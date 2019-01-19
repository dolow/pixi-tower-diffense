import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import UpdateObject from 'interfaces/UpdateObject';
import GameManager from 'managers/GameManager';

/**
 * ゲーム結果を表現する
 */
export default class BattleResult extends PIXI.Container implements UpdateObject {
  /**
   * アニメーション終了フラグ
   */
  public animationEnded: boolean = false;

  /**
   * アニメーション終了時コールバック
   */
  public onAnimationEnded: () => void = () => {};

  /**
   * 表示する PIXI.Sprite インスタンス
   */
  private sprite!: PIXI.Sprite;

  /**
   * このエフェクトで使用するリソースリスト
   */
  public static get resourceList(): string[] {
    return [
      ResourceMaster.Static.BattleResultWin,
      ResourceMaster.Static.BattleResultLose
    ];
  }

  /**
   * コンストラクタ
   */
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

  /**
   * UpdateObject インターフェース実装
   * 削除フラグが立っているか返す
   */
  public isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
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

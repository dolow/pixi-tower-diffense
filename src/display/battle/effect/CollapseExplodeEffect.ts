import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import SoundManager from 'managers/SoundManager';
import UpdateObject from 'interfaces/UpdateObject';

/**
 * 破壊時の爆発を表現するエフェクト
 */
export default class CollapseExplodeEffect extends PIXI.Container implements UpdateObject {
  /**
   * スプライトアニメーションを更新する頻度
   */
  public static readonly TextureFrameUpdateFrequency: number = 4;

  /**
   * 経過フレーム数
   */
  private elapsedFrameCount: number = 0;
  /**
   * 表示する PIXI.Sprite インスタンス
   */
  private sprite!: PIXI.Sprite;

  /**
   * このエフェクトで使用するリソースリスト
   */
  public static get resourceList(): string[] {
    return [
      ResourceMaster.Static.CollapseExplode,
      ResourceMaster.Audio.Se.Bomb
    ];
  }

  /**
   * コンストラクタ
   */
  constructor() {
    super();
    this.sprite = new PIXI.Sprite(ResourceMaster.TextureFrame.CollapseExplode(1));
    this.sprite.anchor.set(0.5, 0.5);
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
    this.elapsedFrameCount++;

    this.sprite.visible = (this.elapsedFrameCount % 2 === 0);

    if (this.elapsedFrameCount === 1) {
      const sound = SoundManager.getSound(ResourceMaster.Audio.Se.Bomb);
      if (sound) {
        sound.play();
      }
    }

    if (this.elapsedFrameCount % CollapseExplodeEffect.TextureFrameUpdateFrequency === 0) {
      const count = this.elapsedFrameCount / CollapseExplodeEffect.TextureFrameUpdateFrequency;
      const index = Math.floor(count) + 1;
      if (index > ResourceMaster.MaxFrameIndex(ResourceMaster.Static.CollapseExplode)) {
        this.sprite.destroy();
        this.destroy();
        return;
      }

      this.sprite.texture = ResourceMaster.TextureFrame.CollapseExplode(index);
    }
  }
}

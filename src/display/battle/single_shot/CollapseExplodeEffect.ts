import * as PIXI from 'pixi.js';
import Resource from 'Resource';
import SoundManager from 'managers/SoundManager';
import UpdateObject from 'interfaces/UpdateObject';

/**
 * 破壊時の爆発を表現するエフェクト
 */
export default class CollapseExplodeEffect
    extends PIXI.Container
    implements UpdateObject {
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
      Resource.Static.CollapseExplode,
      Resource.Audio.Se.Bomb
    ];
  }

  /**
   * コンストラクタ
   */
  constructor() {
    super();

    this.sprite = new PIXI.Sprite(Resource.TextureFrame.CollapseExplode(1));
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
    if (this.isDestroyed()) {
      return;
    }

    this.elapsedFrameCount++;

    // 半透明を表現
    this.sprite.visible = (this.elapsedFrameCount % 2 === 0);

    // 最初のフレームで効果音を再生する
    if (this.elapsedFrameCount === 1) {
      this.playSe();
    }

    const frequency = CollapseExplodeEffect.TextureFrameUpdateFrequency;

    // テクスチャ更新周期になったら次のテクスチャに切り替える
    if (this.elapsedFrameCount % frequency === 0) {
      const count = this.elapsedFrameCount / frequency;
      const index = Math.floor(count) + 1;
      // すべてのテクスチャが再生されたら自然消滅させる
      if (index > Resource.MaxFrameIndex(Resource.Static.CollapseExplode)) {
        this.sprite.destroy();
        this.destroy();
        return;
      }

      this.sprite.texture = Resource.TextureFrame.CollapseExplode(index);
    }
  }

  /**
   * 効果音を再生する
   */
  private playSe(): void {
    const sound = SoundManager.getSound(Resource.Audio.Se.Bomb);
    if (sound) {
      sound.play();
    }
  }
}

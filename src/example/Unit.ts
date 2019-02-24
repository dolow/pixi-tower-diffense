import * as PIXI from 'pixi.js';
// import Resource from 'Resource';
import UpdateObject from 'interfaces/UpdateObject';
// import Attackable from 'display/battle/Attackable';
import UnitAnimationMaster, { UnitAnimationTypeIndex } from 'interfaces/master/UnitAnimationMaster';

/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit implements UpdateObject {
  /**
   * 表示する PIXI.Sprite インスタンス
   */
  public sprite!: PIXI.Sprite;
  /**
   * 現在のアニメーション種別
   */
  public animationType!: string;
  /**
   * 破棄フラグ
   */
  protected destroyed: boolean = false;

  /**
   * アニメーション情報
   */
  protected animationMaster!: UnitAnimationMaster;

  /**
   * 現在のアニメーションフレーム
   */
  protected animationFrameId: number = 1;

  /**
   * 経過メインループ数
   */
  protected elapsedFrameCount: number = 0;

  /**
   * コンストラクタ
   */
  constructor(animationMaster: UnitAnimationMaster) {
    //super();

    this.animationMaster = animationMaster;
    this.sprite = new PIXI.Sprite();
  }

  /**
   * UpdateObject インターフェース実装
   * 削除フラグが立っているか返す
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }
  /**
   * このオブジェクトと子要素を破棄する
   */
  public destroy(): void {
    this.sprite.destroy();
    this.destroyed = true;
  }

  /**
   * アニメーション再生をリセットする
   */
  public resetAnimation(): void {
    this.elapsedFrameCount = 0;
    this.animationFrameId = 1;
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_dt: number): void {
    this.updateAnimation();
  }

  public updateAnimation(): void {
    const index = this.animationType as UnitAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if (!animation) {
      return;
    }

    if ((this.elapsedFrameCount % animation.updateDuration) === 0) {
      if (this.isAnimationLastFrameTime()) {
        this.resetAnimation();
      }

      const cacheKey = animation.frames[this.animationFrameId - 1];
      this.sprite.texture = PIXI.utils.TextureCache[cacheKey];

      this.animationFrameId++;
    }

    this.elapsedFrameCount++;
  }

  public isAnimationLastFrameTime(): boolean {
    const index = this.animationType as UnitAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if (!animation) {
      return false;
    }
    const duration = animation.updateDuration;
    const lastId = animation.frames.length;
    const maxFrameTime = duration * lastId;
    return this.elapsedFrameCount === maxFrameTime;
  }
}

import * as PIXI from 'pixi.js';
import Resource from 'Resource';
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
   * 経過メインループ数
   */
  protected elapsedFrameCount: number = 0;

  /**
   * アニメーション情報
   */
  protected animationMaster!: UnitAnimationMaster;

  /**
   * 現在のアニメーションフレーム
   */
  protected animationFrameId: number = 1;
  /**
   * 再生をリクエストされたアニメーション種別
   */
  protected requestedAnimationType: string | null = null;

  /**
   * コンストラクタ
   */
  constructor(animationMaster: UnitAnimationMaster) {
    //super();

    this.animationMaster = animationMaster;
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;
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
    this.requestedAnimationType = null;
    this.elapsedFrameCount = 0;
    this.animationFrameId = 1;
  }

  /**
   * 人師種別のアニメーションの再生をリクエストする
   * リクエストされたアニメーションは再生可能になり次第再生される
   */
  public requestAnimation(type: string): void {
    this.requestedAnimationType = type;
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_dt: number): void {
    if (this.requestedAnimationType) {
      if (this.transformAnimationIfPossible()) {
        this.requestedAnimationType = null;
      }
    }

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

  /**
   * アニメーション遷移が可能であれば遷移する
   */
  private transformAnimationIfPossible(): boolean {
    if (
      !this.requestedAnimationType ||
      this.requestedAnimationType === this.animationType
    ) {
      return false;
    }

    let shouldTransform = false;
    const animationTypes = Resource.AnimationTypes.Unit;

    switch (this.animationType) {
      case animationTypes.WAIT:
      case animationTypes.WALK: {
        shouldTransform = true;
        break;
      }
      case animationTypes.DAMAGE: {
        shouldTransform = this.isAnimationLastFrameTime();
        break;
      }
      case animationTypes.ATTACK: {
        if (this.requestedAnimationType === animationTypes.DAMAGE) {
          shouldTransform = true;
        } else {
          shouldTransform = this.isAnimationLastFrameTime();
        }
        break;
      }
      default: break;
    }

    if (shouldTransform) {
      this.animationType = this.requestedAnimationType;
      this.resetAnimation();
      return true;
    }

    return false;
  }
}

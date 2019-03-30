import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';
import Attackable from 'example/Attackable';
import UnitAnimationMaster, { UnitAnimationTypeIndex } from 'interfaces/master/UnitAnimationMaster';

/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends Attackable {
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
   * スポーンした座標
   */
  protected spawnedPosition: PIXI.Point;

  /**
   * spawnedPosition を返す
   */
  public get distanceBasePosition(): PIXI.Point {
    return this.spawnedPosition;
  }

  /**
   * コンストラクタ
   */
  constructor(
    animationMaster: UnitAnimationMaster,
    spawnPosition: { x: number, y: number }
  ) {
    super();

    this.animationType = Resource.AnimationTypes.Unit.WAIT;

    this.animationMaster = animationMaster;
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;

    this.sprite.position.set(
      spawnPosition.x,
      spawnPosition.y
    );

    this.spawnedPosition = new PIXI.Point(
      this.sprite.position.x,
      this.sprite.position.y
    );
    Object.freeze(this.spawnedPosition);
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

import * as PIXI from 'pixi.js';
import Resource from 'Resource';
import UnitAnimationMaster, { UnitAnimationTypeIndex } from 'interfaces/master/UnitAnimationMaster';
import Attackable from 'display/battle/Attackable';
import HealthGauge from 'display/battle/single_shot/HealthGauge';

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
   * スポーンした座標
   */
  protected spawnedPosition!: PIXI.Point;

  /**
   * 現在のアニメーションフレーム
   */
  protected animationFrameId: number = 1;
  /**
   * 再生をリクエストされたアニメーション種別
   */
  protected requestedAnimation: string | null = null;

  /**
   * HealthGauge インスタンス
   * Unit で管理する
   */
  protected healthGauge: HealthGauge | null = null;

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
    spawnPosition: { x: number, y: number },
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
    this.requestedAnimation = null;
    this.elapsedFrameCount   = 0;
    this.animationFrameId = 1;
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_dt: number): void {
    if (this.requestedAnimation) {
      if (this.transformAnimationIfPossible()) {
        this.requestedAnimation = null;
      }
    }

    this.updateAnimation();
  }

  /**
   * 人師種別のアニメーションの再生をリクエストする
   * リクエストされたアニメーションは再生可能になり次第再生される
   */
  public requestAnimation(type: string): void {
    this.requestedAnimation = type;
  }

  /**
   * 現在のアニメーションフレームのインデックスが当たり判定の発生するインデックスかどうかを返す
   */
  public isHitFrame(): boolean {
    if (this.animationFrameId !== this.animationMaster.hitFrame) {
      return false;
    }
    const index = Resource.AnimationTypes.Unit.ATTACK as UnitAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if (!animation) {
      return false;
    }

    return (this.elapsedFrameCount % animation.updateDuration) === 0;
  }
  /**
   * 現在のアニメーションが終了するフレーム時間かどうかを返す
   */
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
   * HealthGauge インスタンスを生成し、座標を設定して返す
   */
  public spawnHealthGauge(fromPercent: number, toPercent: number): HealthGauge {
    if (this.healthGauge) {
      this.healthGauge.destroy();
    }

    const anchor = this.sprite.anchor;
    this.healthGauge = new HealthGauge(fromPercent, toPercent);
    this.healthGauge.position.set(
      this.sprite.position.x - (this.healthGauge.gaugeWidth * anchor.x),
      this.sprite.position.y - (this.healthGauge.gaugeHeight * anchor.y)
    );

    return this.healthGauge;
  }

  /**
   * アニメーションを更新する
   */
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

  /**
   * アニメーション遷移が可能であれば遷移する
   */
  private transformAnimationIfPossible(): boolean {
    const animationTypes = Resource.AnimationTypes.Unit;

    switch (this.requestedAnimation) {
      case animationTypes.WAIT:
      case animationTypes.WALK: {
        if (this.animationType !== animationTypes.WALK) {
          if (this.isAnimationLastFrameTime()) {
            this.animationType = this.requestedAnimation;
            this.resetAnimation();
            return true;
          }
        }
        break;
      }
      case animationTypes.DAMAGE:
      case animationTypes.ATTACK: {
        this.animationType = this.requestedAnimation;
        this.resetAnimation();
        return true;
      }
      default: break;
    }

    return false;
  }
}

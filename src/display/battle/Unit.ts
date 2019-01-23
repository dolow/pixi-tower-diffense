import * as PIXI from 'pixi.js';
import Resource from 'Resource';
import Attackable from 'display/battle/Attackable';
import HealthGauge from 'display/battle/single_shot/HealthGauge';

/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends Attackable {
  /**
   * ユニット ID
   */
  protected unitId!: number;
  /**
   * スポーンした座標
   */
  protected spawnedPosition: PIXI.Point = new PIXI.Point(0, 0);

  /**
   * 現在のアニメーションフレーム
   */
  protected animationFrameIndex: number = 1;
  /**
   * 再生をリクエストされたアニメーション種別
   */
  protected requestedAnimation: string | null = null;

  /**
   * 当たり判定が発生するフレームインデックス
   * マスターデータの値
   */
  protected hitFrame: number = 0;
  /**
   * 最大のフレームインデックス
   * マスターデータの値
   */
  protected animationMaxFrameIndexes: { [key: string]: number } = {};
  /**
   * フレーム更新に必要なrequestAnimationFrame数
   * マスターデータの値
   */
  protected animationUpdateDurations: { [key: string]: number } = {};

  /**
   * HealthGauge インスタンス
   * Unit で管理する
   */
  protected healthGauge: HealthGauge | null = null;

  /**
   * コンストラクタ
   */
  constructor(
    unitId: number,
    animationParam: {
      hitFrame: number,
      spawnPosition: { x: number, y: number },
      animationMaxFrameIndexes: { [key: string]: number },
      animationUpdateDurations: { [key: string]: number }
    }
  ) {
    super();

    this.animationType = Resource.AnimationTypes.Unit.WAIT;

    this.unitId = unitId;

    this.hitFrame = animationParam.hitFrame;
    this.animationMaxFrameIndexes = animationParam.animationMaxFrameIndexes;
    this.animationUpdateDurations = animationParam.animationUpdateDurations;

    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;

    this.sprite.position.set(
      animationParam.spawnPosition.x,
      animationParam.spawnPosition.y
    );

    this.spawnedPosition.x = this.sprite.position.x;
    this.spawnedPosition.y = this.sprite.position.y;
  }

  /**
   * アニメーション再生をリセットする
   */
  public resetAnimation(): void {
    this.requestedAnimation = null;
    this.elapsedFrameCount   = 0;
    this.animationFrameIndex = 1;
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
   * spawnedPosition を返す
   */
  public getSpawnedPosition(): PIXI.Point {
    return this.spawnedPosition;
  }

  /**
   * 現在のアニメーションフレームのインデックスが当たり判定の発生するインデックスかどうかを返す
   */
  public isHitFrame(): boolean {
    if (this.animationFrameIndex !== this.hitFrame) {
      return false;
    }
    const updateDuration = this.animationUpdateDurations[Resource.AnimationTypes.Unit.ATTACK];
    return (this.elapsedFrameCount % updateDuration) === 0;
  }
  /**
   * 現在のアニメーションが終了するフレーム時間かどうかを返す
   */
  public isAnimationLastFrameTime(type: string = this.animationType): boolean {
    const maxFrameTime = this.animationUpdateDurations[type] * this.animationMaxFrameIndexes[type];
    return this.elapsedFrameCount === maxFrameTime;
  }

  /**
   * HealthGauge インスタンスを生成し、座標を設定して返す
   */
  public spawnHealthGauge(fromPercent: number, toPercent: number): HealthGauge {
    if (this.healthGauge) {
      this.healthGauge.destroy();
    }

    this.healthGauge = new HealthGauge(fromPercent, toPercent);
    this.healthGauge.position.set(
      this.sprite.position.x - (this.healthGauge.gaugeWidth * this.sprite.anchor.x),
      this.sprite.position.y - (this.healthGauge.gaugeHeight * this.sprite.anchor.y)
    );

    return this.healthGauge;
  }

  /**
   * アニメーションを更新する
   */
  public updateAnimation(): void {
    const animationUpdateDuration = this.animationUpdateDurations[this.animationType];
    if ((this.elapsedFrameCount % animationUpdateDuration) === 0) {
      if (this.isAnimationLastFrameTime()) {
        this.resetAnimation();
      }

      this.sprite.texture = Resource.TextureFrame.Unit(
        this.animationType,
        this.unitId,
        this.animationFrameIndex
      );

      this.animationFrameIndex++;
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
      case animationTypes.ATTACK: {
        this.animationType = animationTypes.ATTACK;
        this.resetAnimation();
        return true;
      }
      default: break;
    }

    return false;
  }
}

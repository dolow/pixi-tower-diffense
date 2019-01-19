import * as PIXI from 'pixi.js';
import UnitEntity from 'entity/UnitEntity';
import ResourceMaster from 'ResourceMaster';
import UnitState from 'enum/UnitState';
import UpdateObject from 'interfaces/UpdateObject';
import HealthGauge from 'display/battle/effect/HealthGauge';

/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends UnitEntity implements UpdateObject {
  /**
   * PIXI スプライト
   */
  public sprite!: PIXI.Sprite;

  /**
   * スポーンした座標
   */
  protected spawnedPosition: PIXI.Point = new PIXI.Point(0, 0);

  /**
   * 現在のアニメーション種別
   */
  protected animationType: string = ResourceMaster.AnimationTypes.Unit.WAIT;
  /**
   * 現在のアニメーションフレーム
   */
  protected animationFrameIndex: number = 1;
  /**
   * 現在のアニメーション経過フレーム数
   */
  protected elapsedFrameCount: number = 0;

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
  protected animationUpdateDurations: { [key: string]: number } = {}

  protected healthGauge: HealthGauge | null = null;

  protected destroyed: boolean = false;

  constructor(
    unitId: number,
    isPlayer: boolean,
    animationParam: {
      hitFrame: number,
      animationMaxFrameIndexes: { [key: string]: number },
      animationUpdateDurations: { [key: string]: number }
    }
  ) {
    super(unitId, isPlayer);

    this.hitFrame = animationParam.hitFrame;
    this.animationMaxFrameIndexes = animationParam.animationMaxFrameIndexes;
    this.animationUpdateDurations = animationParam.animationUpdateDurations;

    this.sprite = new PIXI.Sprite();
    if (!this.isPlayer) {
      this.sprite.scale.x = -1;
    }

    this.sprite.anchor.x = 0.5;
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  public update(_dt: number): void {
    const animationTypes = ResourceMaster.AnimationTypes.Unit;

    switch (this.state) {
      case UnitState.IDLE: {
        if (this.animationType !== animationTypes.WALK) {
          if (this.isAnimationLastFrameTime()) {
            this.animationType = animationTypes.WALK;
            this.resetAnimation();
          }
        } else {
          this.sprite.position.x = this.spawnedPosition.x + this.distance * (this.isPlayer ? 1 : -1);
        }
        break;
      }
      case UnitState.LOCKED: {
        this.animationType = animationTypes.ATTACK;
        break;
      }
      case UnitState.DEAD:
      default: break;
    }

    this.updateAnimation();
  }

  public saveSpawnedPosition(): PIXI.Point {
    this.spawnedPosition.x = this.sprite.position.x;
    this.spawnedPosition.y = this.sprite.position.y;
    return this.spawnedPosition;
  }

  public isHitFrame(): boolean {
    if (this.animationFrameIndex !== this.hitFrame) {
      return false;
    }
    const updateDuration = this.animationUpdateDurations[ResourceMaster.AnimationTypes.Unit.ATTACK];
    return (this.elapsedFrameCount % updateDuration) === 0;
  }

  public isAnimationLastFrameTime(type: string = this.animationType): boolean {
    const maxFrameTime = this.animationUpdateDurations[type] * this.animationMaxFrameIndexes[type];
    return this.elapsedFrameCount === maxFrameTime;
  }

  public getAnimationType(): string {
    return this.animationType;
  }

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

  public isFoeContact(target: PIXI.Container): boolean {
    const rangeDistance = this.sprite.width * 0.5 + target.width * 0.5;
    return (this.isPlayer)
      ? (this.sprite.position.x + rangeDistance) >= target.position.x
      : (target.position.x + rangeDistance) >= this.sprite.position.x;
  }

  public resetAnimation(): void {
    this.elapsedFrameCount   = 0;
    this.animationFrameIndex = 1;
  }

  public updateAnimation(type?: string): void {
    if (type) {
      this.animationType = type;
    }

    const animationUpdateDuration = this.animationUpdateDurations[this.animationType];
    if ((this.elapsedFrameCount % animationUpdateDuration) === 0) {
      if (this.isAnimationLastFrameTime()) {
        this.resetAnimation();
      }

      this.sprite.texture = ResourceMaster.TextureFrame.Unit(this.animationType, this.unitId, this.animationFrameIndex);

      this.animationFrameIndex++;
    }

    this.elapsedFrameCount++;
  }

  public destroy(): void {
    this.sprite.destroy();
    this.destroyed = true;
  }
}

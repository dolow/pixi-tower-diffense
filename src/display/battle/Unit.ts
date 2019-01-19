import * as PIXI from 'pixi.js';
import UnitEntity from 'entity/UnitEntity';
import ResourceMaster from 'ResourceMaster';
import AttackableState from 'enum/AttackableState';
import UpdateObject from 'interfaces/UpdateObject';
import HealthGauge from 'display/battle/effect/HealthGauge';

/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends UnitEntity implements UpdateObject {
  /**
   * 表示する PIXI.Sprite インスタンス
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
   * 経過フレーム数
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

  /**
   * HealthGauge インスタンス
   * Unit で管理する
   */
  protected healthGauge: HealthGauge | null = null;

  /**
   * 破棄フラグ
   */
  protected destroyed: boolean = false;

  /**
   * コンストラクタ
   */
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

  /**
   * UpdateObject インターフェース実装
   * 削除フラグが立っているか返す
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_dt: number): void {
    const animationTypes = ResourceMaster.AnimationTypes.Unit;

    switch (this.state) {
      case AttackableState.IDLE: {
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
      case AttackableState.LOCKED: {
        this.animationType = animationTypes.ATTACK;
        break;
      }
      case AttackableState.DEAD:
      default: break;
    }

    this.updateAnimation();
  }

  /**
   * 現在の position を生成位置として保持する
   */
  public saveSpawnedPosition(): PIXI.Point {
    this.spawnedPosition.x = this.sprite.position.x;
    this.spawnedPosition.y = this.sprite.position.y;
    return this.spawnedPosition;
  }

  /**
   * 現在のアニメーションフレームのインデックスが当たり判定の発生するインデックスかどうかを返す
   */
  public isHitFrame(): boolean {
    if (this.animationFrameIndex !== this.hitFrame) {
      return false;
    }
    const updateDuration = this.animationUpdateDurations[ResourceMaster.AnimationTypes.Unit.ATTACK];
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
   * 現在のアニメーション種別を返す
   */
  public getAnimationType(): string {
    return this.animationType;
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
   * 接敵しているかどうかを返す
   */
  public isFoeContact(target: PIXI.Container): boolean {
    const rangeDistance = this.sprite.width * 0.5 + target.width * 0.5;
    return (this.isPlayer)
      ? (this.sprite.position.x + rangeDistance) >= target.position.x
      : (target.position.x + rangeDistance) >= this.sprite.position.x;
  }

  /**
   * アニメーション時間をリセットする
   */
  public resetAnimation(): void {
    this.elapsedFrameCount   = 0;
    this.animationFrameIndex = 1;
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

      this.sprite.texture = ResourceMaster.TextureFrame.Unit(this.animationType, this.unitId, this.animationFrameIndex);

      this.animationFrameIndex++;
    }

    this.elapsedFrameCount++;
  }

  /**
   * このオブジェクトと子要素を破棄する
   */
  public destroy(): void {
    this.sprite.destroy();
    this.destroyed = true;
  }
}

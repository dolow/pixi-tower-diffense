import * as PIXI from 'pixi.js';
import UnitEntity from 'entity/UnitEntity';
import ResourceMaster from 'ResourceMaster';

/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends UnitEntity {
  /**
   * PIXI スプライト
   */
  public sprite!: PIXI.Sprite;

  /**
   * 現在のアニメーション種別
   */
  protected animationType: string = '';
  /**
   * 現在のアニメーションフレーム
   */
  protected animationFrameIndex: number = 1;
  /**
   * 現在のアニメーション経過フレーム数
   */
  protected elapsedFrameCount: number = 0;

  protected hitFrame: number = 0;
  protected animationMaxFrameIndexes: { [key: string]: number } = {};
  protected animationUpdateDurations: { [key: string]: number } = {}

  public isHitFrame(): boolean {
    if (this.animationFrameIndex !== this.hitFrame) {
      return false;
    }
    const updateDuration = this.getAnimationUpdateDuration(ResourceMaster.Unit.AnimationTypes.ATTACK);
    return (this.elapsedFrameCount % updateDuration) === 0;
  }

  public isAnimationLastFrameTime(type: string = this.animationType): boolean {
    const maxFrameTime = this.getAnimationMaxFrameTime(type);
    return this.elapsedFrameCount === maxFrameTime;
  }

  public getAnimationType(): string {
    return this.animationType;
  }
  public getAnimationMaxFrameIndex(type: string): number {
    return this.animationMaxFrameIndexes[type] || 0;
  }
  public getAnimationUpdateDuration(type: string): number {
    return this.animationUpdateDurations[type] || 0;
  }
  public getAnimationMaxFrameTime(type: string): number {
    return this.getAnimationUpdateDuration(type) * this.getAnimationMaxFrameIndex(type);
  }

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

    const animationUpdateDuration = this.getAnimationUpdateDuration(this.animationType);
    if ((this.elapsedFrameCount % animationUpdateDuration) === 0) {
      if (this.isAnimationLastFrameTime()) {
        this.resetAnimation();
      }

      const name = ResourceMaster.Unit.TextureFrameName(this.animationType, this.unitId, this.animationFrameIndex);
      this.sprite.texture = PIXI.utils.TextureCache[name];

      this.animationFrameIndex++;
    }

    this.elapsedFrameCount++;
  }
}

import * as PIXI from 'pixi.js';
import UnitMaster from 'interfaces/master/Unit';
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

  public isHitFrame(): boolean {
    if (this.animationFrameIndex !== this.hitFrame) {
      return false;
    }
    const updateDuration = this.getAnimationUpdateDuration(ResourceMaster.UnitAnimationTypes.ATTACK);
    return (this.elapsedFrameCount % updateDuration) === 0;
  }

  public get unitId(): number {
    return this.master.unitId;
  }
  public get cost(): number {
    return this.master.cost;
  }
  public get maxHealth(): number {
    return this.master.maxHealth;
  }
  public get power(): number {
    return this.master.power;
  }
  public get speed(): number {
    return this.master.speed;
  }
  public get wieldFrames(): number {
    return this.master.wieldFrames;
  }
  public get hitFrame(): number {
    return this.master.hitFrame;
  }

  public isAnimationLastFrameTime(type: string = this.animationType): boolean {
    const maxFrameTime = this.getAnimationMaxFrameTime(type);
    return this.elapsedFrameCount === maxFrameTime;
  }

  public getAnimationType(): string {
    return this.animationType;
  }
  public getAnimationMaxFrameIndex(type: string): number {
    return this.master.animationMaxFrameIndexes[type] || 0;
  }
  public getAnimationUpdateDuration(type: string): number {
    return this.master.animationUpdateDurations[type] || 0;
  }
  public getAnimationMaxFrameTime(type: string): number {
    return this.getAnimationUpdateDuration(type) * this.getAnimationMaxFrameIndex(type);
  }

  constructor(master: UnitMaster, ally: boolean) {
    super(master, ally);
    this.sprite = new PIXI.Sprite();
    if (!this.isPlayer) {
      this.sprite.scale.x = -1;
    }
  }

  public isFoeContact(target: Unit): boolean {
    return (this.isPlayer)
      ? (this.sprite.position.x + this.sprite.width + target.sprite.width) >= target.sprite.position.x
      : (target.sprite.position.x + target.sprite.width + this.sprite.width) >= this.sprite.position.x;
  }

  public resetAnimation(): void {
    this.elapsedFrameCount   = 0;
    this.animationFrameIndex = 1;
  }

  public updateAnimation(type: string): void {
    this.animationType = type;

    const animationUpdateDuration = this.getAnimationUpdateDuration(this.animationType);
    if ((this.elapsedFrameCount % animationUpdateDuration) === 0) {
      if (this.isAnimationLastFrameTime()) {
        this.resetAnimation();
      }

      const name = ResourceMaster.UnitTextureFrameName(this.animationType, this.unitId, this.animationFrameIndex);
      this.sprite.texture = PIXI.utils.TextureCache[name];

      this.animationFrameIndex++;
    }

    this.elapsedFrameCount++;
  }
}

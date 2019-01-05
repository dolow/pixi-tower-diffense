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
   * 現在のアニメーションフレーム
   */
  protected animationFrameIndex: number = 0;
  /**
   * 現在のアニメーション
   */
  protected elapsedFrameCount: number = 0;

  public isHitFrame(): boolean {
    return this.animationFrameIndex === this.hitFrame;
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

  public getAnimationMaxFrameIndex(type: string): number {
    return this.master.animationMaxFrameIndexes[type];
  }
  public getAnimationUpdateDuration(type: string): number {
    return this.master.animationUpdateDurations[type];
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

  public updateAnimation(type: string, index: number = -1): void {
    const animationUpdateDuration = this.getAnimationUpdateDuration(type);
    if (index >= 1) {
      this.elapsedFrameCount   = animationUpdateDuration * (index - 1);
      this.animationFrameIndex = index;
    } else {
      this.elapsedFrameCount++;
      if (this.elapsedFrameCount % animationUpdateDuration !== 0) {
        return;
      }
      this.animationFrameIndex++;
    }

    const animationMaxFrameTime = this.getAnimationMaxFrameTime(type);
    if (this.elapsedFrameCount >= animationMaxFrameTime) {
      this.elapsedFrameCount = 1;
      this.animationFrameIndex = 1;
    }

    const name = ResourceMaster.UnitTextureFrameName(type, this.unitId, this.animationFrameIndex);
    this.sprite.texture = PIXI.utils.TextureCache[name];
  }
}

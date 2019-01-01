import * as PIXI from 'pixi.js';
import UnitMaster from 'interfaces/master/Unit';
import ResourceMaster from 'ResourceMaster';

class UnitEntity {
  // dynamic data
  public id: number  = 0;
  public isPlayer: boolean = true;

  // dynamic data
  public currentHealth: number = 0;
  public state:         number = 0;

  // data for pixi object
  protected currentAnimationType: string = ResourceMaster.UnitAnimationTypes.WAIT;
  protected currentAnimationFrame: number = 0;
  protected currentAnimationTime: number = 0;

  protected master!: UnitMaster;

  constructor(master: UnitMaster, isPlayer: boolean) {
    this.master   = master;
    this.isPlayer = isPlayer;
  }
}

export default class Unit extends UnitEntity {
  // data for pixi object
  public sprite!: PIXI.Sprite;

  public isAlly(target: UnitEntity): boolean {
    return (
      (this.isPlayer  && target.isPlayer) ||
      (!this.isPlayer && !target.isPlayer)
    );
  }

  public isFoe(target: UnitEntity): boolean {
    return (
      (this.isPlayer  && !target.isPlayer) ||
      (!this.isPlayer &&  target.isPlayer)
    );
  }

  public isHitFrame(): boolean {
    return this.currentAnimationFrame === this.hitFrame;
  }

  public damage(value: number): number {
    this.currentHealth -= value;
    return this.currentHealth;
  }

  public get animationType(): string {
    return this.currentAnimationType;
  }
  public get animationFrame(): number {
    return this.currentAnimationFrame;
  }
  public get animationTime(): number {
    return this.currentAnimationTime;
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
    if (type === ResourceMaster.UnitAnimationTypes.DYING) {
      // TODO
      return 1;
    }
    return this.getAnimationUpdateDuration(type) * this.getAnimationMaxFrameIndex(type);
  }

  constructor(master: UnitMaster, ally: boolean) {
    super(master, ally);
    this.sprite = new PIXI.Sprite();
  }

  public isFoeContact(target: Unit): boolean {
    return (this.isPlayer)
      ? (this.sprite.position.x + this.sprite.width) <= target.sprite.position.x
      : (this.sprite.position.x - target.sprite.width) >= target.sprite.position.x;
  }

  public setAnimationType(type: string, keepIndex: boolean = false): void {
    if (this.currentAnimationType === type) {
      return;
    }
    
    this.currentAnimationType = type;
    if (!keepIndex) {
      this.currentAnimationFrame = 1;
    }
  }

  public updateAnimation(): void {
    this.currentAnimationTime++;

    const type = this.currentAnimationType;

    if (this.currentAnimationTime % this.getAnimationUpdateDuration(type) !== 0) {
      return;
    }

    this.currentAnimationFrame++;

    const animationMaxFrameTime = this.getAnimationMaxFrameTime(type);
    if (this.currentAnimationTime >= animationMaxFrameTime) {
      this.currentAnimationTime  = 1;
      this.currentAnimationFrame = 1;
    }

    const name = ResourceMaster.UnitTextureFrameName(type, this.unitId, this.currentAnimationFrame);
    this.sprite.texture = PIXI.utils.TextureCache[name];
  }
}

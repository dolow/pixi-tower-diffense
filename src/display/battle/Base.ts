import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import BaseMaster from 'interfaces/master/Base';
import BaseEntity from 'entity/BaseEntity';

const baseId1SpawnFrameCount = 16;

/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Base extends BaseEntity {
  /**
   * PIXI スプライト
   */
  public sprite!: PIXI.Sprite;

  /**
   * 初期座標、アニメーションなどで更新されるため覚えておく
   */
  protected originalPositon: PIXI.Point = new PIXI.Point();
  /**
   * 現在のアニメーション種別
   */
  protected animationType: string = ResourceMaster.Base.AnimationTypes.IDLE;
  /**
   * 現在の経過フレーム数
   */
  protected elapsedFrameCount: number = 0;

  constructor(master: BaseMaster, isPlayer: boolean) {
    super(master, isPlayer);
    
    this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache[ResourceMaster.Base.TextureFrameName(master.baseId)]);
    if (!isPlayer) {
      this.sprite.scale.x  = -1.0;
    }

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;
  }

  public init(options?: any): void {
    switch (this.master.baseId) {
      case 1: this.sprite.position.y = 300; break;
      case 2:
      default: this.sprite.position.y = 200; break;
    }

    if (options && options.x) {
      this.sprite.position.x = options.x;
    }

    this.originalPositon.set(this.sprite.position.x, this.sprite.position.y);
  }

  public resetAnimation(): void {
    this.animationType = ResourceMaster.Base.AnimationTypes.IDLE;
    this.elapsedFrameCount = 0;
  }

  public updateAnimation(type?: string): void {
    if (type) {
      this.animationType = type;
      this.elapsedFrameCount = 0;
    }

    if (this.master.baseId === 2) {
      const r  = 20;  // range
      const t  = 400; // duration

      this.sprite.position.y = this.originalPositon.y + -r * Math.sin((2 * Math.PI / t) * this.elapsedFrameCount);
      this.elapsedFrameCount++;
    } else {
      let cacheName = "";
      switch (this.animationType) {
        case ResourceMaster.Base.AnimationTypes.SPAWN: {
          cacheName = ResourceMaster.Base.TextureFrameName(this.master.baseId, 2);
        }
        case ResourceMaster.Base.AnimationTypes.IDLE:
        default: {
          cacheName = ResourceMaster.Base.TextureFrameName(this.master.baseId, 1);
        }
      }
      this.sprite.texture = PIXI.utils.TextureCache[cacheName];

      if (this.animationType === ResourceMaster.Base.AnimationTypes.SPAWN &&
        this.elapsedFrameCount >= baseId1SpawnFrameCount) {
          this.resetAnimation;
      } else {
        this.elapsedFrameCount++;
      }
    }
  }
}

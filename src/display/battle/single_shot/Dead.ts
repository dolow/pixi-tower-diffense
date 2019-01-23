import * as PIXI from 'pixi.js';
import Resource from 'Resource';
import UpdateObject from 'interfaces/UpdateObject';

const TO_RAD = Math.PI / 180.0;

/**
 * 死亡を表現するエフェクト
 */
export default class Dead extends PIXI.Container implements UpdateObject {
  /**
   * 経過フレーム数
   */
  private elapsedFrameCount: number = 0;

  private bucket!: PIXI.Sprite;
  private spirit!: PIXI.Sprite;

  /**
   * このエフェクトで使用するリソースリスト
   */
  public static get resourceList(): string[] {
    return [
      Resource.Static.DeadBucket,
      Resource.Static.DeadSpirit
    ];
  }

  /**
   * コンストラクタ
   */
  constructor(flip: boolean) {
    super();

    const textureCache = PIXI.utils.TextureCache;
    const bucketTexture = textureCache[Resource.Static.DeadBucket];
    const spiritTexture = textureCache[Resource.Static.DeadSpirit];

    this.bucket = new PIXI.Sprite(bucketTexture);
    this.spirit = new PIXI.Sprite(spiritTexture);

    this.bucket.anchor.y = 0.0;
    this.spirit.position.y = -this.bucket.height;

    if (flip) {
      this.bucket.scale.x = -1;
      this.spirit.scale.x = -1;
      this.spirit.position.x = -((this.bucket.width - this.spirit.width) * 0.5);
    } else {
      this.spirit.position.x = (this.bucket.width - this.spirit.width) * 0.5;
    }

    this.addChild(this.bucket);
    this.addChild(this.spirit);

    this.spirit.visible = false;
  }

  /**
   * UpdateObject インターフェース実装
   * 削除フラグが立っているか返す
   */
  public isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_delta: number): void {
    if (this.isDestroyed()) {
      return;
    }

    this.elapsedFrameCount++;

    // 本来はアニメーションを扱うミドルウェアで行う部分
    switch (this.elapsedFrameCount) {
      case 4:  this.bucket.rotation = 25.0 * TO_RAD;  break;
      case 8:  this.bucket.rotation = -25.0 * TO_RAD; break;
      case 12: this.bucket.rotation = 15.0 * TO_RAD;  break;
      case 16: this.bucket.rotation = -15.0 * TO_RAD; break;
      case 20: this.bucket.rotation = 5.0 * TO_RAD;  break;
      case 24: this.bucket.rotation = -5.0 * TO_RAD; break;
      case 26: {
        this.bucket.rotation = 0.0;
        this.spirit.visible = true;
        break;
      }
      case 80: {
        // 規定フレーム数再生したら自然消滅させる
        this.bucket.destroy();
        this.spirit.destroy();
        this.destroy();
        break;
      }
      default: {
        if (this.elapsedFrameCount > 26) {
          this.spirit.visible = (this.elapsedFrameCount % 2 === 0);
          this.spirit.y = this.spirit.y - 3;
        }
      }
    }
  }
}

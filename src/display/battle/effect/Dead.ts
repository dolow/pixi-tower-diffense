import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';

const TO_RAD = Math.PI / 180.0;

export default class Dead extends PIXI.Container {
  private static resourceListCache: string[] = [];

  private bucket!: PIXI.Sprite;
  private spirit!: PIXI.Sprite;

  private elapsedFrameCount: number = 0;

  public static get resourceList(): string[] {
    if (Dead.resourceListCache.length === 0) {
      Dead.resourceListCache.push(ResourceMaster.Dead.Bucket());
      Dead.resourceListCache.push(ResourceMaster.Dead.Spirit());
    }
    return Dead.resourceListCache;
  }

  constructor(flip: boolean) {
    super();

    const textureCache = PIXI.utils.TextureCache;
    const bucketTexture = textureCache[ResourceMaster.Dead.Bucket()];
    const spiritTexture = textureCache[ResourceMaster.Dead.Spirit()];

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

  public update(_delta: number): void {
    this.elapsedFrameCount++;

    // TODO: move to sub system
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
      case 80: this.destroy(); break;
      default: {
        if (this.elapsedFrameCount > 26) {
          this.spirit.y = this.spirit.y - 3;
        }
      }
    }
  }
}

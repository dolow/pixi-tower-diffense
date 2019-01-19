import * as PIXI from 'pixi.js';
import UpdateObject from 'display/UpdateObject';

export default class HealthGaugeEffect extends PIXI.Container implements UpdateObject {
  public gaugeWidth: number = 60;
  public gaugeHeight: number = 8;

  public maxColor: number = 0xFF4444;
  public currentColor: number = 0xFFFF44;
  public lineColor: number = 0x222222;

  private elapsedFrameCount: number = 0;
  private reducingFrameCount: number = 4;
  private remainingFrameCount: number = 24;

  private maxGraphic!: PIXI.Graphics;
  private currentGraphic!: PIXI.Graphics;

  private fromPercent!: number;
  private toPercent!: number;

  public static get resourceList(): string[] {
    return [];
  }

  constructor(fromPercent: number, toPercent: number) {
    super();

    this.fromPercent = fromPercent;
    this.toPercent   = toPercent;

    this.maxGraphic = new PIXI.Graphics();
    this.maxGraphic.lineStyle(2, this.lineColor, 1);
    this.maxGraphic.beginFill(this.maxColor, 1);
    this.maxGraphic.drawRect(0, 0, this.gaugeWidth, this.gaugeHeight);

    this.currentGraphic = new PIXI.Graphics();
    this.currentGraphic.beginFill(this.currentColor, 1);
    this.currentGraphic.drawRect(0, 0, 0, 22);

    this.addChild(this.maxGraphic);
    this.addChild(this.currentGraphic);
  }

  public isDestroyed(): boolean {
    return this._destroyed;
  }

  public update(_delta: number): void {
    this.elapsedFrameCount++;

    if (this.elapsedFrameCount <= this.reducingFrameCount) {
      const reduceProgress = this.elapsedFrameCount / this.reducingFrameCount;
      const currentPercent = this.fromPercent - (this.fromPercent - this.toPercent) * reduceProgress;

      this.currentGraphic.clear();
      this.currentGraphic.beginFill(this.currentColor, 1);
      this.currentGraphic.drawRect(0, 0, this.gaugeWidth * currentPercent, this.gaugeHeight);
    } else if (this.elapsedFrameCount > this.remainingFrameCount) {
      this.maxGraphic.destroy();
      this.currentGraphic.destroy();
      this.destroy();
    }
  }
}

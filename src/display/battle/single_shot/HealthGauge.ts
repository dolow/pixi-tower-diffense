import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';

/**
 * health 増減を表現するエフェクト
 */
export default class HealthGaugeEffect extends PIXI.Container implements UpdateObject {
  /**
   * ゲージの幅
   */
  public gaugeWidth: number = 60;
  /**
   * ゲージの高さ
   */
  public gaugeHeight: number = 8;

  /**
   * 最大 health の色
   */
  public maxColor: number = 0xFF4444;
  /**
   * 現在の health の色
   */
  public currentColor: number = 0xFFFF44;
  /**
   * 枠線の色
   */
  public lineColor: number = 0x222222;

  /**
   * 経過フレーム数
   */
  private elapsedFrameCount: number = 0;
  /**
   * 減少アニメーションのフレーム数
   */
  private reducingFrameCount: number = 4;
  /**
   * 表示するフレーム数
   */
  private activeFrameCount: number = 24;

  /**
   * 最大 health 用の PIXI.Graphics
   */
  private maxGraphic!: PIXI.Graphics;
  /**
   * 現在の health 用の PIXI.Graphics
   */
  private currentGraphic!: PIXI.Graphics;

  /**
   * 減算元のゲージ比率
   */
  private fromPercent!: number;
  /**
   * 減算後のゲージ比率
   */
  private toPercent!: number;

  /**
   * このエフェクトで使用するリソースリスト
   */
  public static get resourceList(): string[] {
    return [];
  }

  /**
   * コンストラクタ
   */
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

    if (this.elapsedFrameCount <= this.reducingFrameCount) {
      // ゲージ増減アニメーション
      const reduceDistance = this.fromPercent - this.toPercent;
      const reduceProgress = this.elapsedFrameCount / this.reducingFrameCount;
      const currentPercent = this.fromPercent - reduceDistance * reduceProgress;

      this.currentGraphic.clear();
      this.currentGraphic.beginFill(this.currentColor, 1);
      this.currentGraphic.drawRect(0, 0, this.gaugeWidth * currentPercent, this.gaugeHeight);
    } else if (this.elapsedFrameCount > this.activeFrameCount) {
      // 規定フレーム数再生したら自然消滅させる
      this.maxGraphic.destroy();
      this.currentGraphic.destroy();
      this.destroy();
    }
  }
}

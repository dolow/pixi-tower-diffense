import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';
import Attackable from 'example/Attackable';

/**
 * 拠点の振舞い、及び見た目に関する処理を行う
 * Attackable を継承する
 */
export default class Castle extends Attackable {
  /**
   * 爆発エフェクト用コンテナ
   */
  public explodeContainer: PIXI.Container = new PIXI.Container();

  /**
   * 拠点 ID
   */
  protected castleId!: number;

  /**
   * コンストラクタ
   */
  constructor(
    castleId: number,
    spawnPosition: { x: number, y: number }
  ) {
    super(spawnPosition);

    this.castleId = castleId;

    this.sprite.texture = Resource.TextureFrame.Castle(castleId);
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_dt: number): void {
    this.updateAnimation();
  }

  /**
   * アニメーションを更新する
   */
  public updateAnimation(): void {
    this.elapsedFrameCount++;
  }
}

import * as PIXI from 'pixi.js';
import UpdateObject from 'interfaces/UpdateObject';

/**
 * エンティティの振舞い、及び見た目に関する処理を行う
 */
export default abstract class Attackable implements UpdateObject {
  /**
   * 表示する PIXI.Sprite インスタンス
   */
  public sprite!: PIXI.Sprite;
  /**
   * 現在のアニメーション種別
   */
  public animationType!: string;
  /**
   * 現在のアニメーションフレーム
   */
  protected animationFrameIndex: number = 1;
  /**
   * 経過フレーム数
   */
  protected elapsedFrameCount: number = 0;
  /**
   * 破棄フラグ
   */
  protected destroyed: boolean = false;

  constructor() {
    this.animationType = '';
  }

  /**
   * UpdateObject インターフェース実装
   * 削除フラグが立っているか返す
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(_dt: number): void {
    // NOOP
  }

  /**
   * 接敵しているかどうかを返す
   */
  public isFoeContact(target: PIXI.Container): boolean {
    const r1x1 = this.sprite.position.x;
    const r1x2 = this.sprite.position.x + this.sprite.width;
    const r2x1 = target.position.x;
    const r2x2 = target.position.x + target.width;

    return (r1x1 < r2x2 && r1x2 > r2x1);
  }

  /**
   * 現在のアニメーション種別を返す
   */
  public getAnimationType(): string {
    return this.animationType;
  }

  /**
   * アニメーション時間をリセットする
   */
  public resetAnimation(): void {
    // NOOP
  }

  /**
   * アニメーションを更新する
   */
  public updateAnimation(): void {
    // NOOP
  }

  /**
   * このオブジェクトと子要素を破棄する
   */
  public destroy(): void {
    this.sprite.destroy();
    this.destroyed = true;
  }
}

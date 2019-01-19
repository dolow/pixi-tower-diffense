import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';

/**
 * 即座にシーン遷移させるトランジション
 */
export default class Immediate implements Transition {
  private onTransitionFinished: () => void = () => {};

  /**
   * トランジション描画物を含む PIXI.Container インスタンスを返す
   */
  public getContainer(): PIXI.Container | null {
    return null;
  }

  /**
   * トランジション開始処理
   * このトランジションは即時終了させる
   */
  public begin(): void {
    this.onTransitionFinished();
  }
  /**
   * トランジションが開始しているかどうかを返す
   * このトランジションは即時終了するため true になることなはない
   */
  public isBegan(): boolean {
    return false;
  }
  /**
   * トランジションが終了しているかどうかを返す
   * このトランジションは即時終了するため false になることなはない
   */
  public isFinished(): boolean {
    return true;
  }
  /**
   * トランジションが実行中かどうかを返す
   * このトランジションは即時終了するため true になることなはない
   */
  public isActive(): boolean {
    return false;
  }

  /**
   * トランジションを更新する
   * このトランジションは即時終了するため何も行わない
   */
  public update(_dt: number): void {
    return;
  }

  /**
   * トランジション終了時のコールバックを登録する
   */
  public setCallback(callback: () => void): void {
    this.onTransitionFinished = callback;
  }
}

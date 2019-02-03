import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';
/**
 * 即座にシーン遷移させるトランジション
 */
export default class Immediate implements Transition {
    private onTransitionFinished;
    private finished;
    /**
     * トランジション描画物を含む PIXI.Container インスタンスを返す
     */
    getContainer(): PIXI.Container | null;
    /**
     * トランジション開始処理
     * このトランジションは即時終了させる
     */
    begin(): void;
    /**
     * トランジションが開始しているかどうかを返す
     * このトランジションは即時終了するため true になることなはない
     */
    isBegan(): boolean;
    /**
     * トランジションが終了しているかどうかを返す
     */
    isFinished(): boolean;
    /**
     * トランジションが実行中かどうかを返す
     * このトランジションは即時終了するため true になることなはない
     */
    isActive(): boolean;
    /**
     * トランジションを更新する
     * このトランジションは即時終了するため何も行わない
     */
    update(_dt: number): void;
    /**
     * トランジション終了時のコールバックを登録する
     */
    setCallback(callback: () => void): void;
}

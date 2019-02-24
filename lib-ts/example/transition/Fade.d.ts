import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';
/**
 * トランジションのフェード表現
 */
export default class Fade implements Transition {
    /**
     * フェード開始時の黒画面アルファ
     */
    private alphaFrom;
    /**
     * フェード終了時の黒画面アルファ
     */
    private alphaTo;
    /**
     * 1フレーム毎の黒画面アルファ加算値
     */
    private alphaProgress;
    /**
     * 黒画面のコンテナ
     */
    private container;
    /**
     * 黒画面の描画
     */
    private overlay;
    /**
     * トランジション開始フラグ
     */
    private transitionBegan;
    /**
     * トランジション終了フラグ
     */
    private transitionFinished;
    /**
     * トランジション終了時コールバック
     */
    private onTransitionFinished;
    /**
     * コンストラクタ
     */
    constructor(alphaFrom: number, alphaTo: number, alphaProgress: number);
    /**
     * トランジション描画物を含む PIXI.Container インスタンスを返す
     */
    getContainer(): PIXI.Container | null;
    /**
     * トランジション開始処理
     */
    begin(): void;
    /**
     * トランジションが開始しているかどうかを返す
     */
    isBegan(): boolean;
    /**
     * トランジションが終了しているかどうかを返す
     */
    isFinished(): boolean;
    /**
     * トランジションが実行中かどうかを返す
     */
    isActive(): boolean;
    /**
     * トランジションを更新する
     */
    update(_dt: number): void;
    /**
     * トランジション終了時のコールバックを登録する
     */
    setCallback(callback: () => void): void;
}

import * as PIXI from 'pixi.js';
import PixiApplicationOptionsV5 from 'interfaces/pixiv5/ApplicationOptionsV5';
import Scene from 'scenes/Scene';
/**
 * ゲーム全体のマネージャ
 * 主にシーンを扱う
 */
export default class GameManager {
    /**
     * シングルトン新スタンス
     */
    static instance: GameManager;
    /**
     * PIXI.Application インスタンス
     * 初期化時に生成される
     */
    game: PIXI.Application;
    /**
     * シーンのリソースロード完了フラグ
     * シーントランジションを制御するためのフラグ
     */
    private sceneResourceLoaded;
    /**
     * シーンのトランジション完了フラグ
     * シーントランジションを制御するためのフラグ
     */
    private sceneTransitionOutFinished;
    /**
     * 現在のシーンインスタンス
     */
    private currentScene?;
    /**
     * コンストラクタ
     * PIXI.Application インスタンスはユーザ任意のものを使用する
     */
    constructor(app: PIXI.Application);
    /**
     * ゲームを起動する
     * 画面サイズや PixiApplicationOptionsV5 を渡すことができる
     */
    static start(params: {
        glWidth: number;
        glHeight: number;
        option?: PixiApplicationOptionsV5;
    }): void;
    /**
     * フルスクリーンに切り替える
     */
    static requestFullScreen(): void;
    /**
     * 可能であれば新しいシーンへのトランジションを開始する
     */
    static transitionInIfPossible(newScene: Scene): boolean;
    /**
     * シーンをロードする
     * 新しいシーンのリソース読み込みと古いシーンのトランジションを同時に開始する
     * いずれも完了したら、新しいシーンのトランジションを開始する
     */
    static loadScene(newScene: Scene): void;
    /**
     * HTML canvas のりサイズ処理を行う
     */
    static resizeCanvas(): void;
    /**
     * 動作環境に応じて適切ならフルスクリーン設定をする
     */
    private static enableFullScreenIfNeeded;
}

import * as PIXI from 'pixi.js';
import Scene from 'example/Scene';
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
     * シーンのトランジション完了フラグ
     * シーントランジションを制御するためのフラグ
     */
    private sceneTransitionOutFinished;
    private sceneResourceLoaded;
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
     * 画面サイズや PIXI.ApplicationOptions を渡すことができる
     */
    static start(params: {
        glWidth: number;
        glHeight: number;
        option?: PIXI.ApplicationOptions;
    }): void;
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
}

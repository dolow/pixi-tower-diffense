import * as PIXI from 'pixi.js'
import Scene from 'scenes/Scene';

/**
 * ゲーム全体のマネージャ
 * 主にシーンを扱う
 */
export default class GameManager {
  /**
   * シングルトン新スタンス
   */
  public static instance: GameManager;

  /**
   * シーンのリソースロード完了フラグ
   * シーントランジションを制御するためのフラグ
   */
  public static sceneResourceLoaded: boolean = true;
  /**
   * シーンのトランジション完了フラグ
   * シーントランジションを制御するためのフラグ
   */
  public static sceneTransitionOutFinished: boolean = true;

  /**
   * PIXI.Application インスタンス
   * 初期化時に生成される
   */
  public game!: PIXI.Application;
  /**
   * 現在のシーンインスタンス
   */
  private currentScene?: Scene;

  /**
   * コンストラクタ
   * PIXI.Application インスタンスはユーザ任意のものを使用する
   */
  constructor(app: PIXI.Application) {
    if (GameManager.instance) {
      throw new Error('GameManager can be instantiate only once');
    }

    this.game = app;
  }

  /**
   * ゲームを起動する
   * 画面サイズや PIXI.ApplicationOptions を渡すことができる
   */
  public static start(params: { width: number, height: number, option?: PIXI.ApplicationOptions }): void {
    const game = new PIXI.Application(params.width, params.height, params.option);
    GameManager.instance = new GameManager(game);
    document.body.appendChild(GameManager.instance.game.view);

    GameManager.instance.game.ticker.add((delta: number) => {
      if (GameManager.instance.currentScene) {
        GameManager.instance.currentScene.update(delta);
      }
    });
  }

  /**
   * シーンがロード中、あるいはトランジション中であるかを返す
   */
  public static get isSceneLoading(): boolean {
    return (!GameManager.sceneResourceLoaded || !GameManager.sceneTransitionOutFinished);
  }

  /**
   * 可能であれば新しいシーンへのトランジションを開始する
   */
  public static transitionInIfPossible(newScene: Scene): boolean {
    if (GameManager.isSceneLoading) {
      return false;
    }

    const instance = GameManager.instance;

    if (instance.currentScene) {
      instance.currentScene.destroy();
    }
    instance.currentScene = newScene;

    if (instance.game) {
      instance.game.stage.addChild(newScene);
    }

    newScene.beginTransitionIn((_: Scene) => {});

    return true;
  }

  /**
   * シーンをロードする
   * 新しいシーンのリソース読み込みと古いシーンのトランジションを同時に開始する
   * いずれも完了したら、新しいシーンのトランジションを開始する
   */
  public static loadScene(newScene: Scene): void {
    const instance = GameManager.instance;

    if (instance.currentScene) {
      GameManager.sceneResourceLoaded = false;
      GameManager.sceneTransitionOutFinished = false;
      newScene.loadResource(() => {
        GameManager.sceneResourceLoaded = true;
        GameManager.transitionInIfPossible(newScene);
      });
      instance.currentScene.beginTransitionOut((_: Scene) => {
        GameManager.sceneTransitionOutFinished = true;
        GameManager.transitionInIfPossible(newScene);
      });
    } else {
      GameManager.sceneTransitionOutFinished = true;
      newScene.loadResource(() => {
        GameManager.sceneResourceLoaded = true;
        GameManager.transitionInIfPossible(newScene);
      });
    }
  }
}

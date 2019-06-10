import * as PIXI from 'pixi.js';
import { detect } from 'detect-browser';
import SoundManager from 'example/SoundManager';
import Scene from 'example/Scene';

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
   * PIXI.Application インスタンス
   * 初期化時に生成される
   */
  public game!: PIXI.Application;

  /**
   * シーンのトランジション完了フラグ
   * シーントランジションを制御するためのフラグ
   */
  private sceneTransitionOutFinished: boolean = true;
  private sceneResourceLoaded: boolean = true;

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
  public static start(params: {
    glWidth: number,
    glHeight: number,
    option?: PIXI.ApplicationOptions
  }): void {
    // PIXI Application 生成
    const game = new PIXI.Application(params.glWidth, params.glHeight, params.option);
    // GameManager インスタンス生成
    const instance = new GameManager(game);
    GameManager.instance = instance;

    SoundManager.init();

    // canvas を DOM に追加
    document.body.appendChild(game.view);

    // リサイズイベントの登録
    window.addEventListener('resize', GameManager.resizeCanvas);

    // サイズ初期化
    GameManager.resizeCanvas();

    // 必要であればフルスクリーンの有効化
    GameManager.enableFullScreenIfNeeded();

    // メインループ
    game.ticker.add((delta: number) => {
      if (instance.currentScene) {
        instance.currentScene.update(delta);
      }
    });
  }
  /**
   * 可能であれば新しいシーンへのトランジションを開始する
   */
  public static transitionInIfPossible(newScene: Scene): boolean {
    const instance = GameManager.instance;

    if (!instance.sceneResourceLoaded || !instance.sceneTransitionOutFinished) {
      return false;
    }

    if (instance.currentScene) {
      instance.currentScene.destroy({ children: true });
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
      instance.sceneResourceLoaded = false;
      instance.sceneTransitionOutFinished = false;
      newScene.beginLoadResource(() => {
        instance.sceneResourceLoaded = true;
        GameManager.transitionInIfPossible(newScene);
      });
      instance.currentScene.beginTransitionOut((_: Scene) => {
        instance.sceneTransitionOutFinished = true;
        GameManager.transitionInIfPossible(newScene);
      });
    } else {
        instance.sceneTransitionOutFinished = true;
        newScene.beginLoadResource(() => {
          instance.sceneResourceLoaded = true;
          GameManager.transitionInIfPossible(newScene);
        });
    }
  }

  /**
   * HTML canvas のりサイズ処理を行う
   */
  public static resizeCanvas(): void {
    const game = GameManager.instance.game;
    const renderer = game.renderer;

    let canvasWidth;
    let canvasHeight;

    const rendererWidthRatio = renderer.width / renderer.height;
    const windowWidthRatio = window.innerWidth / window.innerHeight;

    // 画面比率に合わせて縦に合わせるか横に合わせるか決める
    if (windowWidthRatio > rendererWidthRatio) {
      canvasWidth = window.innerHeight * (renderer.width / renderer.height);
      canvasHeight = window.innerHeight;
    } else {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerWidth * (renderer.height / renderer.width);
    }

    game.view.style.width  = `${canvasWidth}px`;
    game.view.style.height = `${canvasHeight}px`;
  }

  /**
   * フルスクリーンに切り替える
   */
  public static requestFullScreen(): void {
    const body = window.document.body as any;
    const requestFullScreen =
      body.requestFullScreen || body.webkitRequestFullScreen;
    requestFullScreen.call(body);
  }

  /**
   * 動作環境に応じて適切ならフルスクリーン設定をする
   */
  private static enableFullScreenIfNeeded(): void {
    const browser = detect();
    // iOS は対応していないが一応記述しておく
    if (browser && (browser.os === 'iOS' || browser.os === 'Android OS')) {
      const type = typeof document.ontouchend;
      const eventName = (type === 'undefined') ? 'mousedown' : 'touchend';
      document.body.addEventListener(eventName, GameManager.requestFullScreen);
    }
  }
}

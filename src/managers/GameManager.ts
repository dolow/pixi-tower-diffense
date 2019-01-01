import * as PIXI from 'pixi.js'
import Scene from 'scenes/Scene';

export default class GameManager {
  public static instance: GameManager;

  public game!: PIXI.Application;
  private currentScene?: Scene;

  constructor(app: PIXI.Application) {
    if (GameManager.instance) {
      throw new Error('GameManager can be instantiate only once');
    }

    this.game = app;
  }

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

  public static sceneResourceLoaded:        boolean = true;
  public static sceneTransitionOutFinished: boolean = true;

  public static get isSceneLoading(): boolean {
    return (!GameManager.sceneResourceLoaded || !GameManager.sceneTransitionOutFinished);
  }

  public static replaceSceneIfPossible(newScene: Scene): boolean {
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

  public static loadScene(newScene: Scene): void {
    const instance = GameManager.instance;

    if (instance.currentScene) {
      GameManager.sceneResourceLoaded = false;
      GameManager.sceneTransitionOutFinished = false;
      newScene.loadResource(() => {
        GameManager.sceneResourceLoaded = true;
        GameManager.replaceSceneIfPossible(newScene);
      });
      instance.currentScene.beginTransitionOut((_: Scene) => {
        GameManager.sceneTransitionOutFinished = true;
        GameManager.replaceSceneIfPossible(newScene);
      });
    } else {
      GameManager.sceneTransitionOutFinished = true;
      newScene.loadResource(() => {
        GameManager.sceneResourceLoaded = true;
        GameManager.replaceSceneIfPossible(newScene);
      });
    }
  }
}

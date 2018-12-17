import * as PIXI from 'pixi.js'
import Scene from './scenes/Scene';

export default class GameManager {
  public static instance: GameManager;

  private pixiApp?: PIXI.Application;
  private currentScene?: Scene;

  constructor() {
    if (GameManager.instance) {
      throw new Error('GameManager can be instantiate only once');
    }
  }

  public static start(initialScene: Scene, params: { width: number, height: number, option?: PIXI.ApplicationOptions }): void {
    const instance = GameManager.instance;

    instance.pixiApp = new PIXI.Application(params.width, params.height, params.option);
    document.body.appendChild(instance.pixiApp.view);

    GameManager.loadScene(initialScene);

    instance.pixiApp.ticker.add((delta: number) => {
      if (instance.currentScene) {
        instance.currentScene.update(delta);
      }
    });
  }

  public static loadScene(scene: Scene): void {
    const instance = GameManager.instance;

    if (instance.currentScene) {
      instance.currentScene.destroy();
    }
    instance.currentScene = scene;
    if (instance.pixiApp) {
      instance.pixiApp.stage.addChild(instance.currentScene);
    }
  }
}

GameManager.instance = new GameManager();

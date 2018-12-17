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
    GameManager.instance.pixiApp = new PIXI.Application(params.width, params.height, params.option);
    document.body.appendChild(GameManager.instance.pixiApp.view);

    GameManager.instance.loadScene(initialScene);

    GameManager.instance.pixiApp.ticker.add((delta: number) => {
      if (GameManager.instance.currentScene) {
        GameManager.instance.currentScene.update(delta);
      }
    });
  }

  public loadScene(scene: Scene): void {
    if (this.currentScene) {
      this.currentScene.destroy();
    }
    this.currentScene = scene;
    if (this.pixiApp) {
      this.pixiApp.stage.addChild(this.currentScene);
    }
  }
}

GameManager.instance = new GameManager();

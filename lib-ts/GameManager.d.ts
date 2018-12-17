import * as PIXI from 'pixi.js';
import Scene from './scenes/Scene';
export default class GameManager {
    static instance: GameManager;
    private pixiApp?;
    private currentScene?;
    constructor();
    static start(initialScene: Scene, params: {
        width: number;
        height: number;
        option?: PIXI.ApplicationOptions;
    }): void;
    loadScene(scene: Scene): void;
}

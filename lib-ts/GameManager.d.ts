import * as PIXI from 'pixi.js';
import Scene from './scenes/Scene';
export default class GameManager {
    static instance: GameManager;
    game: PIXI.Application;
    private currentScene?;
    constructor(app: PIXI.Application);
    static start(params: {
        width: number;
        height: number;
        option?: PIXI.ApplicationOptions;
    }): void;
    static loadScene(scene: Scene): void;
}

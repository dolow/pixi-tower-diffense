import * as PIXI from 'pixi.js';
import Scene from 'scenes/Scene';
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
    static sceneResourceLoaded: boolean;
    static sceneTransitionOutFinished: boolean;
    static readonly isSceneLoading: boolean;
    static replaceSceneIfPossible(newScene: Scene): boolean;
    static loadScene(newScene: Scene): void;
}

import * as PIXI from 'pixi.js';
export default class Background extends PIXI.Container {
    private static resourceListCache;
    static readonly resourceList: string[];
    init(): void;
}

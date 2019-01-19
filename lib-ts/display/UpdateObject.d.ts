import * as PIXI from 'pixi.js';
export default class UpdateObject extends PIXI.Container {
    isDestroyed(): boolean;
    update(_dt: number): void;
}

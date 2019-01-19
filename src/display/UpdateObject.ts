import * as PIXI from 'pixi.js';

export default class UpdateObject extends PIXI.Container {
  public isDestroyed(): boolean {
    return this._destroyed;
  }
  public update(_dt: number): void {

  }
}

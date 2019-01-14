import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition'

export default class Immediate implements Transition {
  private onTransitionFinished: () => void = () => {};

  public getContainer(): PIXI.Container | null{
    return null;
  }

  public begin(): void {
    this.onTransitionFinished();
  }
  public isBegan(): boolean {
    return false;
  }
  public isFinished(): boolean {
    return false;
  }
  public isActive(): boolean {
    return false;
  }

  public update(_dt: number): void {
    return;
  }

  public setCallback(callback: () => void): void {
    this.onTransitionFinished = callback;
  }
}

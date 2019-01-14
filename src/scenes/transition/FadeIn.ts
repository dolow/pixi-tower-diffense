import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';
import GameManager from 'managers/GameManager';

export default class FadeOut implements Transition {
  private container = new PIXI.Container();
  private overlay = new PIXI.Graphics();

  private transitionBegan: boolean = false;
  private transitionFinished: boolean = false;
  private onTransitionFinished: () => void = () => {};

  constructor() {
    const width = GameManager.instance.game.view.width;
    const height = GameManager.instance.game.view.height;

    this.container.addChild(this.overlay);
    this.overlay.beginFill(0x000000);
    this.overlay.moveTo(0, 0);
    this.overlay.lineTo(width, 0);
    this.overlay.lineTo(width, height);
    this.overlay.lineTo(0, height);
    this.overlay.endFill();

    this.overlay.alpha = 1;

    this.container.addChild(this.overlay);
  }

  public getContainer(): PIXI.Container | null {
    return this.container;
  }

  public begin(): void {
    this.transitionBegan = true;
  }
  public isBegan(): boolean {
    return this.transitionBegan;
  }
  public isFinished(): boolean {
    return this.transitionFinished;
  }
  public isActive(): boolean {
    return this.isBegan() && !this.isFinished();
  }

  public update(_dt: number): void {
    if (!this.transitionBegan) {
      return;
    }
    if (this.transitionFinished) {
      return;
    }
    if (this.overlay.alpha <= 0.0) {
      this.onTransitionFinished();
      this.transitionFinished = true;
    } else {
      this.overlay.alpha -= 0.02;
    }
  }

  public setCallback(callback: () => void): void {
    this.onTransitionFinished = callback;
  }
}

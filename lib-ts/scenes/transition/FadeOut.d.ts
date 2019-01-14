import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';
export default class FadeOut implements Transition {
    private container;
    private overlay;
    private transitionBegan;
    private transitionFinished;
    private onTransitionFinished;
    constructor();
    getContainer(): PIXI.Container | null;
    begin(): void;
    isBegan(): boolean;
    isFinished(): boolean;
    isActive(): boolean;
    update(_dt: number): void;
    setCallback(callback: () => void): void;
}

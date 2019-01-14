import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';
export default class Immediate implements Transition {
    private onTransitionFinished;
    getContainer(): PIXI.Container | null;
    begin(): void;
    isBegan(): boolean;
    isFinished(): boolean;
    isActive(): boolean;
    update(_dt: number): void;
    setCallback(callback: () => void): void;
}

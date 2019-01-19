import * as PIXI from 'pixi.js';
/**
 * シーントランジションのインターフェース
 */
export default interface Transition {
    getContainer(): PIXI.Container | null;
    begin(): void;
    isBegan(): boolean;
    isFinished(): boolean;
    isActive(): boolean;
    update(dt: number): void;
    setCallback(callback: () => void): void;
}

import * as PIXI from 'pixi.js';
import UnitMaster from 'interfaces/master/Unit';
declare class UnitEntity {
    id: number;
    isPlayer: boolean;
    currentHealth: number;
    state: number;
    protected currentAnimationType: string;
    protected currentAnimationFrame: number;
    protected currentAnimationTime: number;
    protected master: UnitMaster;
    constructor(master: UnitMaster, isPlayer: boolean);
}
export default class Unit extends UnitEntity {
    sprite: PIXI.Sprite;
    isAlly(target: UnitEntity): boolean;
    isFoe(target: UnitEntity): boolean;
    isHitFrame(): boolean;
    damage(value: number): number;
    readonly animationType: string;
    readonly animationFrame: number;
    readonly animationTime: number;
    readonly unitId: number;
    readonly cost: number;
    readonly maxHealth: number;
    readonly power: number;
    readonly speed: number;
    readonly wieldFrames: number;
    readonly hitFrame: number;
    getAnimationMaxFrameIndex(type: string): number;
    getAnimationUpdateDuration(type: string): number;
    getAnimationMaxFrameTime(type: string): number;
    constructor(master: UnitMaster, ally: boolean);
    isFoeContact(target: Unit): boolean;
    setAnimationType(type: string, keepIndex?: boolean): void;
    updateAnimation(): void;
}
export {};

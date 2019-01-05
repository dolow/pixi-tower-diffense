/**
 * ユニットパラメータマスターのスキーマ定義
 */
export default interface UnitMaster {
    unitId: number;
    cost: number;
    maxHealth: number;
    power: number;
    speed: number;
    wieldFrames: number;
    hitFrame: number;
    animationMaxFrameIndexes: {
        [key: string]: number;
    };
    animationUpdateDurations: {
        [key: string]: number;
    };
}

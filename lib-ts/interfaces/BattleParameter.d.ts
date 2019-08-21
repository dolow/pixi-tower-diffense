import CastleMaster from 'interfaces/master/CastleMaster';
/**
 * バトル開始時に渡すパラメータのインターフェース
 */
export default interface BattleParameter {
    unitSlotCount: number;
    stageId: number;
    unitIds: number[];
    playerCastle: CastleMaster;
    cost: {
        recoveryPerFrame: number;
        max: number;
    };
}

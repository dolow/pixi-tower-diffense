import CastleMaster from 'interfaces/master/CastleMaster';
/**
 * user_battle API のスキーマ定義
 */
export default interface UserBattle {
  unlockedUnitIds: number[];
  unlockedStageId: number;
  castle: CastleMaster;
  cost: {
    max: number;
    recoveryPerFrame: number;
  };
}

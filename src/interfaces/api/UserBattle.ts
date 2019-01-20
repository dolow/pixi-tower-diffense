/**
 * user_battle API のスキーマ定義
 */
export default interface UserBattle {
  unlockedUnitIds: number[];
  unlockedStageId: number;
  base: {
    baseId: number;
    maxHealth: number;
  };
  cost: {
    max: number;
    recoveryPerFrame: number;
  };
}

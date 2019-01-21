/**
 * バトル開始時に渡すパラメータのインターフェース
 */
export default interface BattleParameter {
  unitSlotCount: number;
  stageId: number;
  unitIds: number[];
  playerBase: {
    baseId: number;
    maxHealth: number;
  };
  cost: {
    recoveryPerFrame: number;
    max: number;

  };
}

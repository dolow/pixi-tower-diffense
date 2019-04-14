/**
 * バトル開始時に渡すパラメータのインターフェース
 */
export default interface BattleParameter {
  unitSlotCount: number;
  stageId: number;
  unitIds: number[];
  playerCastle: {
    castleId: number;
    maxHealth: number;
  };
  cost: {
    recoveryPerFrame: number;
    max: number;

  };
}

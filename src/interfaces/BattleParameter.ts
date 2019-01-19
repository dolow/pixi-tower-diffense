export default interface BattleParameter {
  maxUnitSlotCount: number;
  fieldId: number;
  stageId: number;
  unitIds: number[];
  baseIdMap: {
    player: number;
    ai: number;
  };
  playerBaseParams: {
    maxHealth: number;
  };
  cost: {
    recoveryPerFrame: number;
    max: number;
    
  };
}

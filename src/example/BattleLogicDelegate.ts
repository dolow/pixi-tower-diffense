import UnitEntity from 'example/UnitEntity';

/**
 * BattleLogic が委譲する処理を著したインターフェース
 */
export default interface BattleLogicDelegate {
  /**
   * UnitEntity が生成された時のコールバック
   */
  onUnitEntitySpawned(entity: UnitEntity, basePosition: number): void;
  /**
   * 利用可能コストが変動した際のコールバック
   */
  onAvailableCostUpdated(
    cost: number,
    maxCost: number,
    availablePlayerUnitIds: number[]
  ): void;
  /**
   * UnitEntity が歩いた時のコールバック
   */
  onUnitEntityWalked(entity: UnitEntity): void;

  /**
   * 渡されたユニットが移動可能か返す
   */
  shouldUnitWalk(unit: UnitEntity): boolean;
}

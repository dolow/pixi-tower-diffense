/**
 * BattleLogic が委譲する処理を著したインターフェース
 */
export default interface BattleLogicDelegate {
  /**
   * 利用可能コストが変動した際のコールバック
   */
  onAvailableCostUpdated(cost: number, maxCost: number): void;
}

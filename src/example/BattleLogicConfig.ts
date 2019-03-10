export default class BattleLogicConfig {
  /**
   * フレームごとのコスト回復量
   */
  public costRecoveryPerFrame: number = 0;
  /**
   * 利用可能コストの上限値
   */
  public maxAvailableCost: number = 100;

  constructor(params?: {
    costRecoveryPerFrame?: number,
    maxAvailableCost?: number
  }) {
    if (!params) {
      return;
    }

    if (params.costRecoveryPerFrame) {
      this.costRecoveryPerFrame = params.costRecoveryPerFrame;
    }
    if (params.maxAvailableCost) {
      this.maxAvailableCost = params.maxAvailableCost;
    }
  }
}

import BattleLogicDelegate from 'example/BattleLogicDelegate';
import BattleLogicConfig from 'example/BattleLogicConfig';

/**
 * ゲーム内バトルパートのマネージャ
 * ゲームロジックを中心に扱う
 */
export default class BattleLogic {
  /**
   * バトル設定
   */
  private config: BattleLogicConfig = new BattleLogicConfig();
  /**
   * BattleLogicDelegate 実装オブジェクト
   */
  private delegator: BattleLogicDelegate | null = null;
  /**
   * 現在の利用可能なコスト
   */
  private availableCost: number = 0;

  /**
   * デリゲータとマスタ情報で初期化
   */
  public init(params: {
    delegator: BattleLogicDelegate,
    config?: BattleLogicConfig
  }): void {
    if (params.config) {
      this.config = params.config;
    }

    // デリゲータのセット
    this.delegator = params.delegator;
  }

  /**
   * ゲーム更新処理
   * 外部から任意のタイミングでコールする
   */
  public update(_delta: number): void {
    // コスト回復
    this.updateAvailableCost(this.availableCost + this.config.costRecoveryPerFrame);
  }

  /**
   * 利用可能なコストを更新し、専用のコールバックをコールする
   */
  private updateAvailableCost(newCost: number): number {
    let cost = newCost;
    if (cost > this.config.maxAvailableCost) {
      cost = this.config.maxAvailableCost;
    }
    this.availableCost = cost;
    if (this.delegator) {
      // コスト更新後処理をデリゲータに委譲する
      this.delegator.onAvailableCostUpdated(this.availableCost, this.config.maxAvailableCost);
    }

    return this.availableCost;
  }
}

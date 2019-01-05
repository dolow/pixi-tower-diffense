import UnitMaster from 'interfaces/master/Unit';

/**
 * ユニットのパラメータ
 */
export default class UnitEntity {
  /**
   * 一意の ID
   * ユニット生成順に動的に割り当てられる
   */
  public id: number  = 0;
  /**
   * プレイヤー側のユニットかどうか
   */
  public isPlayer: boolean = true;
  /**
   * 現在のヒットポイント
   */
  public currentHealth: number = 0;
  /**
   * ステート
   */
  public state: number = 0;
  /**
   * 拠点からの距離
   */
  public distance: number = 0;
  /**
   * ロック中のユニット
   */
  public lockedUnit: UnitEntity | null = null;

  /**
   * ユニットマスターデータ
   */
  protected master!: UnitMaster;

  constructor(master: UnitMaster, isPlayer: boolean) {
    this.master   = master;
    this.isPlayer = isPlayer;
  }

  public isAlly(target: UnitEntity): boolean {
    return (
      (this.isPlayer  && target.isPlayer) ||
      (!this.isPlayer && !target.isPlayer)
    );
  }

  public isFoe(target: UnitEntity): boolean {
    return (
      (this.isPlayer  && !target.isPlayer) ||
      (!this.isPlayer &&  target.isPlayer)
    );
  }

  public damage(value: number): number {
    this.currentHealth -= value;
    return this.currentHealth;
  }
}

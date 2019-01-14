import BaseMaster from 'interfaces/master/Base';
import AttackableEntity from 'entity/AttackableEntity';

/**
 * 拠点のパラメータ
 */
export default class BaseEntity extends AttackableEntity {
  /**
   * プレイヤー拠点からの距離
   */
  public distanceFromPlayerBase: number = 0;

  /**
   * ユニットマスターデータ
   */
  protected master!: BaseMaster;

  constructor(master: BaseMaster, isPlayer: boolean) {
    super(isPlayer);
    this.master = master;
  }
}

import AttackableEntity from 'entity/AttackableEntity';

/**
 * ユニットのパラメータ
 */
export default class UnitEntity extends AttackableEntity {
  /**
   * ユニットID
   */
  public unitId: number  = 0;

  /**
   * コンストラクタ
   */
  constructor(unitId: number, isPlayer: boolean) {
    super(isPlayer);

    this.unitId = unitId;
  }
}

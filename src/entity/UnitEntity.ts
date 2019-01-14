import AttackableEntity from 'entity/AttackableEntity';

/**
 * ユニットのパラメータ
 */
export default class UnitEntity extends AttackableEntity {
  /**
   * 一意の ID
   * ユニット生成順に動的に割り当てられる
   */
  public id: number  = 0;

  /**
   * ユニットID
   */
  public unitId: number  = 0;
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
  public lockedEntity: AttackableEntity | null = null;

  constructor(unitId: number, isPlayer: boolean) {
    super(isPlayer);

    this.unitId = unitId;
  }
}

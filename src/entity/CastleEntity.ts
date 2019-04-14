import AttackableEntity from 'entity/AttackableEntity';

/**
 * 拠点のパラメータ
 */
export default class BaseEntity extends AttackableEntity {
  /**
   * 拠点 ID
   */
  public castleId: number = 0;

  /**
   * コンストラクタ
   */
  constructor(baseId: number, isPlayer: boolean) {
    super(isPlayer);

    this.castleId = baseId;
    this.isUnit = false;
  }
}

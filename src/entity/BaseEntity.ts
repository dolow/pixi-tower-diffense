import AttackableEntity from 'entity/AttackableEntity';

/**
 * 拠点のパラメータ
 */
export default class BaseEntity extends AttackableEntity {
  /**
   * 拠点 ID
   */
  public baseId: number = 0;

  /**
   * コンストラクタ
   */
  constructor(baseId: number, isPlayer: boolean) {
    super(isPlayer);

    this.baseId = baseId;
  }
}

import AttackableEntity from 'entity/AttackableEntity';

/**
 * 拠点のパラメータ
 */
export default class BaseEntity extends AttackableEntity {
  public baseId!: number;

  constructor(baseId: number, isPlayer: boolean) {
    super(isPlayer);

    this.baseId = baseId;
  }
}

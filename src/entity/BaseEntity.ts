import AttackableEntity from 'entity/AttackableEntity';

/**
 * 拠点のパラメータ
 */
export default class BaseEntity extends AttackableEntity {
  public baseId: number = 0;
  public state: number = 0;

  constructor(baseId: number, isPlayer: boolean) {
    super(isPlayer);

    this.baseId = baseId;
  }
}

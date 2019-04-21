import AttackableEntity from 'entity/AttackableEntity';
import CastleMaster from 'interfaces/master/CastleMaster';

/**
 * 拠点のパラメータ
 */
export default class CastleEntity extends AttackableEntity {
  /**
   * 拠点 ID
   */
  public castleId: number = 0;

  /**
   * コンストラクタ
   */
  constructor(master: CastleMaster, isPlayer: boolean) {
    super(isPlayer);

    this.castleId = master.castleId;
    this.maxHealth = master.maxHealth;
    this.currentHealth = this.maxHealth;
  }
}

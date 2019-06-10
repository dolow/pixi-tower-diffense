import AttackableEntity from 'entity/AttackableEntity';
import CastleMaster from 'interfaces/master/CastleMaster';
/**
 * 拠点のパラメータ
 */
export default class CastleEntity extends AttackableEntity {
    /**
     * 拠点 ID
     */
    castleId: number;
    /**
     * コンストラクタ
     */
    constructor(master: CastleMaster, isPlayer: boolean);
}

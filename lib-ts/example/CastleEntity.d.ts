import AttackableEntity from 'example/AttackableEntity';
import CastleMaster from 'example/CastleMaster';
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

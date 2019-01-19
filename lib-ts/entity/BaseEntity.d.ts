import AttackableEntity from 'entity/AttackableEntity';
/**
 * 拠点のパラメータ
 */
export default class BaseEntity extends AttackableEntity {
    /**
     * 拠点 ID
     */
    baseId: number;
    /**
     * コンストラクタ
     */
    constructor(baseId: number, isPlayer: boolean);
}

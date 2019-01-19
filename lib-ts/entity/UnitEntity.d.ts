import AttackableEntity from 'entity/AttackableEntity';
/**
 * ユニットのパラメータ
 */
export default class UnitEntity extends AttackableEntity {
    /**
     * ユニットID
     */
    unitId: number;
    /**
     * コンストラクタ
     */
    constructor(unitId: number, isPlayer: boolean);
}

import AttackableEntity from 'entity/AttackableEntity';
/**
 * ユニットのパラメータ
 */
export default class UnitEntity extends AttackableEntity {
    /**
     * 一意の ID
     * ユニット生成順に動的に割り当てられる
     */
    id: number;
    /**
     * ユニットID
     */
    unitId: number;
    /**
     * コンストラクタ
     */
    constructor(unitId: number, isPlayer: boolean);
}

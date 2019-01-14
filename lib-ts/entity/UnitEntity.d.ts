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
     * ステート
     */
    state: number;
    /**
     * 拠点からの距離
     */
    distance: number;
    /**
     * ロック中のユニット
     */
    lockedEntity: AttackableEntity | null;
    constructor(unitId: number, isPlayer: boolean);
}

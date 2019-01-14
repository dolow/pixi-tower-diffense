import UnitMaster from 'interfaces/master/Unit';
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
    /**
     * ユニットマスターデータ
     */
    protected master: UnitMaster;
    constructor(master: UnitMaster, isPlayer: boolean);
}

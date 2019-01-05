import UnitMaster from 'interfaces/master/Unit';
/**
 * ユニットのパラメータ
 */
export default class UnitEntity {
    /**
     * 一意の ID
     * ユニット生成順に動的に割り当てられる
     */
    id: number;
    /**
     * プレイヤー側のユニットかどうか
     */
    isPlayer: boolean;
    /**
     * 現在のヒットポイント
     */
    currentHealth: number;
    /**
     * ステート
     */
    state: number;
    /**
     * ユニットマスターデータ
     */
    protected master: UnitMaster;
    constructor(master: UnitMaster, isPlayer: boolean);
    isAlly(target: UnitEntity): boolean;
    isFoe(target: UnitEntity): boolean;
    damage(value: number): number;
}

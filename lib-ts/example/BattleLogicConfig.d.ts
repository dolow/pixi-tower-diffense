export default class BattleLogicConfig {
    /**
     * フレームごとのコスト回復量
     */
    costRecoveryPerFrame: number;
    /**
     * 利用可能コストの上限値
     */
    maxAvailableCost: number;
    /**
     * ノックバック条件となる体力閾値
     * [0.5] の場合、体力が 0.5 以上から 0.5 未満に変動した場合にノックバックする
     */
    knockBackHealthThreasholds: number[];
    constructor(params?: {
        costRecoveryPerFrame?: number;
        maxAvailableCost?: number;
        knockBackHealthThreasholds?: number[];
    });
}

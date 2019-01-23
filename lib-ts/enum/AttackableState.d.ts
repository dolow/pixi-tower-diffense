/**
 * バトルエンティティのステート
 */
declare const AttackableState: Readonly<{
    IDLE: number;
    ENGAGED: number;
    DEAD: number;
    WAIT: number;
}>;
export default AttackableState;

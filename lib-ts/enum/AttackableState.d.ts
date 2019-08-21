/**
 * バトルエンティティのステート
 */
declare const AttackableState: Readonly<{
    IDLE: number;
    ENGAGED: number;
    KNOCK_BACK: number;
    DEAD: number;
    WAIT: number;
}>;
export default AttackableState;

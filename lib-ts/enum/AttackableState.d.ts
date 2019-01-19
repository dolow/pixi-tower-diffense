/**
 * バトルエンティティのステート
 */
declare const AttackableState: Readonly<{
    IDLE: number;
    LOCKED: number;
    DEAD: number;
    WAIT: number;
}>;
export default AttackableState;

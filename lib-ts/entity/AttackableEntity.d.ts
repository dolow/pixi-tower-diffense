/**
 * 拠点のパラメータ
 */
export default class AttackableEntity {
    /**
     * プレイヤー側のユニットかどうか
     */
    isPlayer: boolean;
    /**
     * 現在のヒットポイント
     */
    currentHealth: number;
    constructor(isPlayer: boolean);
    isAlly(target: AttackableEntity): boolean;
    isFoe(target: AttackableEntity): boolean;
    damage(value: number): number;
}

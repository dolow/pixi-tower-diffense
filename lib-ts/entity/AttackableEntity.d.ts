/**
 * 拠点のパラメータ
 */
export default class AttackableEntity {
    /**
     * 一意の ID
     * エンティティ生成順に動的に割り当てられる
     */
    id: number;
    /**
     * プレイヤー側のユニットかどうか
     */
    isPlayer: boolean;
    /**
     * ステート
     */
    state: number;
    /**
     * 現在のヒットポイント
     */
    currentHealth: number;
    /**
     * 拠点からの距離
     */
    distance: number;
    /**
     * ロック中のユニット
     */
    lockedEntity: AttackableEntity | null;
    /**
     * コンストラクタ
     */
    constructor(isPlayer: boolean);
    /**
     * 引数のエンティティが仲間かどうかを返す
     */
    isAlly(target: AttackableEntity): boolean;
    /**
     * 引数のエンティティが敵対しているかどうかを返す
     */
    isFoe(target: AttackableEntity): boolean;
    /**
     * health 値を引数で増減させる
     */
    damage(value: number): number;
}

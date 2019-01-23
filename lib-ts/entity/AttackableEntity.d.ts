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
     * 接敵中のエンティティ
     */
    engagedEntity: AttackableEntity | null;
    /**
     * コンストラクタ
     */
    constructor(isPlayer: boolean);
}

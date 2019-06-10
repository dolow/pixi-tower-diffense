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
     * 最大体力
     */
    maxHealth: number;
    /**
     * 現在の体力
     */
    currentHealth: number;
    /**
     * 現在フレームでのダメージ数
     */
    currentFrameDamage: number;
    /**
     * ノックバック経過フレーム数
     */
    currentKnockBackFrameCount: number;
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

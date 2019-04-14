/**
 * 拠点のパラメータ
 */
export default class AttackableEntity {
  /**
   * 一意の ID
   * エンティティ生成順に動的に割り当てられる
   */
  public id: number = 0;
  /**
   * プレイヤー側のユニットかどうか
   */
  public isPlayer: boolean = true;
  /**
   * ユニットかどうか
   */
  public isUnit: boolean = true;
  /**
   * ステート
   */
  public state: number = 0;
  /**
   * 最大体力
   */
  public maxHealth: number = 0;
  /**
   * 現在の体力
   */
  public currentHealth: number = 0;
  /**
   * 現在フレームでのダメージ数
   */
  public currentFrameDamage: number = 0;
  /**
   * ノックバック経過フレーム数
   */
  public currentKnockBackFrameCount: number = 0;
  /**
   * 拠点からの距離
   */
  public distance: number = 0;
  /**
   * 接敵中のエンティティ
   */
  public engagedEntity: AttackableEntity | null = null;

  /**
   * コンストラクタ
   */
  constructor(isPlayer: boolean) {
    this.isPlayer = isPlayer;
  }
}

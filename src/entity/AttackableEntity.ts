/**
 * 拠点のパラメータ
 */
export default class AttackableEntity {
  /**
   * プレイヤー側のユニットかどうか
   */
  public isPlayer: boolean = true;
  /**
   * ステート
   */
  public state: number = 0;
  /**
   * 現在のヒットポイント
   */
  public currentHealth: number = 0;
  /**
   * 拠点からの距離
   */
  public distance: number = 0;
  /**
   * ロック中のユニット
   */
  public lockedEntity: AttackableEntity | null = null;

  /**
   * コンストラクタ
   */
  constructor(isPlayer: boolean) {
    this.isPlayer = isPlayer;
  }

  /**
   * 引数のエンティティが仲間かどうかを返す
   */
  public isAlly(target: AttackableEntity): boolean {
    return (
      (this.isPlayer  && target.isPlayer) ||
      (!this.isPlayer && !target.isPlayer)
    );
  }

  /**
   * 引数のエンティティが敵対しているかどうかを返す
   */
  public isFoe(target: AttackableEntity): boolean {
    return !this.isAlly(target);
  }

  /**
   * health 値を引数で増減させる
   */
  public damage(value: number): number {
    this.currentHealth -= value;
    return this.currentHealth;
  }
}

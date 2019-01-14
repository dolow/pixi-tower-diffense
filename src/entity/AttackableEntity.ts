/**
 * 拠点のパラメータ
 */
export default class AttackableEntity {
  /**
   * プレイヤー側のユニットかどうか
   */
  public isPlayer: boolean = true;
  /**
   * 現在のヒットポイント
   */
  public currentHealth: number = 0;

  constructor(isPlayer: boolean) {
    this.isPlayer = isPlayer;
  }

  public isAlly(target: AttackableEntity): boolean {
    return (
      (this.isPlayer  && target.isPlayer) ||
      (!this.isPlayer && !target.isPlayer)
    );
  }

  public isFoe(target: AttackableEntity): boolean {
    return (
      (this.isPlayer  && !target.isPlayer) ||
      (!this.isPlayer &&  target.isPlayer)
    );
  }

  public damage(value: number): number {
    this.currentHealth -= value;
    return this.currentHealth;
  }
}

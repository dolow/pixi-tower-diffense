import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';

export default interface BattleManagerDelegate {
  /**
   * 拠点を生成する際のコールバック
   */
  spawnBaseEntity(baseId: number, isPlayer: boolean): BaseEntity | null;
  /**
   * ユニットを生成する際のコールバック
   */
  spawnUnitEntity(unitId: number, baseEntity: BaseEntity, isPlayer: boolean): UnitEntity | null;
  /**
   * 拠点のステートが変更した際のコールバック
   */
  onBaseStateChanged(base: BaseEntity, oldState: number): void;
  /**
   * ユニットのステートが変更した際のコールバック
   */
  onUnitStateChanged(unit: UnitEntity, oldState: number): void;
  /**
   * 拠点が更新される際のコールバック
   */
  onBaseUpdated(unit: BaseEntity): void;
  /**
   * ユニットが更新される際のコールバック
   */
  onUnitUpdated(unit: UnitEntity): void;
  /**
   * 利用可能コストが変動した際のコールバック
   */
  onAvailableCostUpdated(cost: number): void;
  /**
   * ゲームが終了した際のコールバック
   */
  onGameOver(isPlayerWon: boolean): void;
  /**
   * 渡されたユニットが接敵可能か返す
   */
  shouldLockUnit(attacker: AttackableEntity, target: UnitEntity): boolean;
  /**
   * 渡されたユニットが接敵可能か返す
   */
  shouldLockBase(attacker: AttackableEntity, target: BaseEntity): boolean;
  /**
   * 渡されたユニットが攻撃可能か返す
   */
  shouldDamage(attacker: AttackableEntity, target: AttackableEntity): boolean;
  /**
   * 渡されたユニットが移動可能か返す
   */
  shouldUnitWalk(unit: UnitEntity): boolean;
}

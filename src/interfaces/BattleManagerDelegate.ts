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
  spawnUnitEntity(unitId: number, isPlayer: boolean): UnitEntity | null;
  /**
   * 拠点を生成する際のコールバック
   */
  //spawnUnit(unitId: number, isPlayer: boolean): UnitEntity;
  /**
   * ユニットを生成する際のコールバック
   */
  onUnitsSpawned(units: UnitEntity[]): void;
  /**
   * ユニットのステートが変更した際のコールバック
   */
  onUnitStateChanged(unit: UnitEntity, oldState: number): void;
  /**
   * ユニットが更新される際のコールバック
   */
  onUnitUpdated(unit: UnitEntity): void;
  /**
   * 利用可能コストが変動した際のコールバック
   */
  onAvailableCostUpdated(cost: number): void;
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

import Unit from 'display/battle/Unit';
import BaseEntity from 'entity/BaseEntity';

export default interface BattleManagerDelegate {
  /**
   * 拠点を生成する際のコールバック
   */
  spawnBase(baseId: number): BaseEntity | null;
  /**
   * 拠点を生成する際のコールバック
   */
  //spawnUnit(unitId: number, isPlayer: boolean): UnitEntity;
  /**
   * ユニットを生成する際のコールバック
   */
  onUnitsSpawned(units: Unit[]): void;
  /**
   * ユニットのステートが変更した際のコールバック
   */
  onUnitStateChanged(unit: Unit, oldState: number): void;
  /**
   * ユニットが更新される際のコールバック
   */
  onUnitUpdated(unit: Unit): void;
  /**
   * 利用可能コストが変動した際のコールバック
   */
  onAvailableCostUpdated(cost: number): void;
  /**
   * 渡されたユニットが接敵可能か返す
   */
  shouldLockUnit(attacker: Unit, target: Unit): boolean;
  /**
   * 渡されたユニットが接敵可能か返す
   */
  shouldLockBase(attacker: Unit, target: BaseEntity): boolean;
  /**
   * 渡されたユニットが攻撃可能か返す
   */
  shouldDamage(attacker: Unit, target: Unit): boolean;
  /**
   * 渡されたユニットが移動可能か返す
   */
  shouldWalk(unit: Unit): boolean;
}

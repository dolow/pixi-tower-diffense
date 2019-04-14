import AttackableEntity from 'example/AttackableEntity';
import UnitEntity from 'example/UnitEntity';

/**
 * BattleLogic が委譲する処理を著したインターフェース
 */
export default interface BattleLogicDelegate {
  /**
   * UnitEntity が生成された時のコールバック
   */
  onUnitEntitySpawned(entity: UnitEntity, basePosition: number): void;
  /**
   * 利用可能コストが変動した際のコールバック
   */
  onAvailableCostUpdated(
    cost: number,
    maxCost: number,
    availablePlayerUnitIds: number[]
  ): void;
  /**
   * エンティティのステートが変更した際のコールバック
   */
  onAttackableEntityStateChanged(
    entity: AttackableEntity,
    oldState: number
  ): void;
  /**
   * UnitEntity が歩いた時のコールバック
   */
  onUnitEntityWalked(entity: UnitEntity): void;
  /**
   * UnitEntity がノックバックした時のコールバック
   */
  onUnitEntityKnockingBack(_entity: UnitEntity, _knockBackRate: number): void;

  /**
   * エンティティの health が変動した際のコールバック
   */
  onAttackableEntityHealthUpdated(
    attacker: AttackableEntity,
    target: AttackableEntity,
    fromHealth: number,
    toHealth: number,
    maxHealth: number
  ): void;

  /**
   * 渡されたエンティティが攻撃可能か返す
   */
  shouldDamage(attacker: AttackableEntity, target: AttackableEntity): boolean;
  /**
   * 渡されたユニットが移動可能か返す
   */
  shouldUnitWalk(unit: UnitEntity): boolean;

  /**
   * 渡されたエンティティが接敵可能か返す
   */
  shouldEngageAttackableEntity(
    attacker: AttackableEntity,
    target: AttackableEntity
  ): boolean;
}

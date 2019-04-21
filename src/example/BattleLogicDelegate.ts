import AttackableEntity from 'example/AttackableEntity';
import CastleEntity from 'example/CastleEntity';
import UnitEntity from 'example/UnitEntity';

/**
 * BattleLogic が委譲する処理を著したインターフェース
 */
export default interface BattleLogicDelegate {
  /**
   * CastleEntity が生成された時のコールバック
   */
  onCastleEntitySpawned(entity: CastleEntity, isPlayer: boolean): void;
  /**
   * UnitEntity が生成された時のコールバック
   */
  onUnitEntitySpawned(entity: UnitEntity): void;
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
  onAttackableEntityWalked(entity: AttackableEntity): void;
  /**
   * UnitEntity がノックバックした時のコールバック
   */
  onAttackableEntityKnockingBack(entity: AttackableEntity, knockBackRate: number): void;

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
  shouldAttackableWalk(attackable: AttackableEntity): boolean;

  /**
   * 渡されたエンティティが接敵可能か返す
   */
  shouldEngageAttackableEntity(
    attacker: AttackableEntity,
    target: AttackableEntity
  ): boolean;
}

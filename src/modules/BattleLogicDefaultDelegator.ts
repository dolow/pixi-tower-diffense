import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import CastleEntity from 'entity/CastleEntity';

/**
 * BattleLogicDelegate のデフォルト実装
 * 基本的には何もしない
 */
export default class DefaultDelegator implements BattleLogicDelegate {
  public onCastleEntitySpawned(
    _entity: CastleEntity,
    _castlePosition: number
  ): void {
  }
  public onUnitEntitySpawned(
    _entity: UnitEntity,
    _castlePosition: number
  ): void {
  }
  public onAttackableEntityStateChanged(
    _entity: AttackableEntity,
    _oldState: number
  ): void {
  }
  public onUnitEntityWalked(_entity: UnitEntity): void {}
  public onUnitEntityKnockingBack(
    _entity: UnitEntity,
    _knockBackRate: number
  ): void {}
  public onAttackableEntityHealthUpdated(
    _attacker: AttackableEntity,
    _target: AttackableEntity,
    _fromHealth: number,
    _toHealth: number,
    _maxHealth: number
  ): void {
  }
  public onAvailableCostUpdated(_cost: number, _maxCost: number): void {}
  public onGameOver(_isPlayerWon: boolean): void {}
  public shouldEngageAttackableEntity(
    _attacker: AttackableEntity,
    _target: AttackableEntity
  ): boolean {
    return true;
  }
  public shouldDamage(
    _attacker: AttackableEntity,
    _target: AttackableEntity
  ): boolean {
    return true;
  }
  public shouldUnitWalk(_unit: UnitEntity): boolean {
    return true;
  }
}

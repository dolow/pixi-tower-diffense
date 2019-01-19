import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';

export default class DefaultDelegator implements BattleManagerDelegate {
  public spawnBaseEntity(_baseId: number, _isPlayer: boolean): BaseEntity | null { return null; };
  public spawnUnitEntity(_unitId: number, _baseEntity: BaseEntity, _isPlayer: boolean): UnitEntity | null { return null; };
  public onBaseStateChanged(_base: BaseEntity, _oldState: number): void {}
  public onUnitStateChanged(_unit: UnitEntity, _oldState: number): void {}
  public onAttackableEntityHealthUpdated(_attacker: AttackableEntity, _target: AttackableEntity, _fromHealth: number, _toHealth: number, _maxHealth: number): void { }
  public onAvailableCostUpdated(_cost: number): void {}
  public onGameOver(_isPlayerWon: boolean): void {}
  public shouldLockUnit(_attacker: AttackableEntity, _target: UnitEntity): boolean { return true; }
  public shouldLockBase(_attacker: AttackableEntity, _target: BaseEntity): boolean { return true; }
  public shouldDamage(_attacker: AttackableEntity, _target: AttackableEntity): boolean { return true; }
  public shouldUnitWalk(_unit: UnitEntity): boolean { return true }
}

import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';
/**
 * BattleLogicDelegate のデフォルト実装
 * 基本的には何もしない
 */
export default class DefaultDelegator implements BattleLogicDelegate {
    spawnBaseEntity(_baseId: number, _isPlayer: boolean): BaseEntity | null;
    spawnUnitEntity(_unitId: number, _baseEntity: BaseEntity, _isPlayer: boolean): UnitEntity | null;
    onAttackableEntityStateChanged(_entity: AttackableEntity, _oldState: number): void;
    onAttackableEntityHealthUpdated(_attacker: AttackableEntity, _target: AttackableEntity, _fromHealth: number, _toHealth: number, _maxHealth: number): void;
    onAvailableCostUpdated(_cost: number): void;
    onGameOver(_isPlayerWon: boolean): void;
    shouldLockAttackableEntity(_attacker: AttackableEntity, _target: AttackableEntity): boolean;
    shouldDamage(_attacker: AttackableEntity, _target: AttackableEntity): boolean;
    shouldUnitWalk(_unit: UnitEntity): boolean;
}

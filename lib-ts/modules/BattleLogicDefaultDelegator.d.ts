import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';
/**
 * BattleLogicDelegate のデフォルト実装
 * 基本的には何もしない
 */
export default class DefaultDelegator implements BattleLogicDelegate {
    onBaseEntitySpawned(_entity: BaseEntity, _basePosition: number): void;
    onUnitEntitySpawned(_entity: UnitEntity, _basePosition: number): void;
    onAttackableEntityStateChanged(_entity: AttackableEntity, _oldState: number): void;
    onUnitEntityWalked(_entity: UnitEntity): void;
    onAttackableEntityHealthUpdated(_attacker: AttackableEntity, _target: AttackableEntity, _fromHealth: number, _toHealth: number, _maxHealth: number): void;
    onAvailableCostUpdated(_cost: number): void;
    onGameOver(_isPlayerWon: boolean): void;
    shouldLockAttackableEntity(_attacker: AttackableEntity, _target: AttackableEntity): boolean;
    shouldDamage(_attacker: AttackableEntity, _target: AttackableEntity): boolean;
    shouldUnitWalk(_unit: UnitEntity): boolean;
}

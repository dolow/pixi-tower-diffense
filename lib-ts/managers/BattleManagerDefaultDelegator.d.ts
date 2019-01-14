import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';
export default class DefaultDelegator implements BattleManagerDelegate {
    spawnBaseEntity(_baseId: number, _isPlayer: boolean): BaseEntity | null;
    spawnUnitEntity(_unitId: number, _baseEntity: BaseEntity, _isPlayer: boolean): UnitEntity | null;
    onBaseStateChanged(_base: BaseEntity, _oldState: number): void;
    onUnitStateChanged(_unit: UnitEntity, _oldState: number): void;
    onBaseUpdated(_base: BaseEntity): void;
    onUnitUpdated(_unit: UnitEntity): void;
    onAvailableCostUpdated(_cost: number): void;
    onGameOver(_isPlayerWon: boolean): void;
    shouldLockUnit(_attacker: AttackableEntity, _target: UnitEntity): boolean;
    shouldLockBase(_attacker: AttackableEntity, _target: BaseEntity): boolean;
    shouldDamage(_attacker: AttackableEntity, _target: AttackableEntity): boolean;
    shouldUnitWalk(_unit: UnitEntity): boolean;
}

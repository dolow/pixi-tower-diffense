import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';
/**
 * BattleLogic が委譲する処理を著したインターフェース
 */
export default interface BattleLogicDelegate {
    /**
     * 拠点を生成する
     */
    spawnBaseEntity(baseId: number, isPlayer: boolean): BaseEntity | null;
    /**
     * ユニットを生成する
     */
    spawnUnitEntity(unitId: number, baseEntity: BaseEntity, isPlayer: boolean): UnitEntity | null;
    /**
     * エンティティのステートが変更した際のコールバック
     */
    onAttackableEntityStateChanged(entity: AttackableEntity, oldState: number): void;
    /**
     * エンティティの health が変動した際のコールバック
     */
    onAttackableEntityHealthUpdated(attacker: AttackableEntity, target: AttackableEntity, fromHealth: number, toHealth: number, maxHealth: number): void;
    /**
     * 利用可能コストが変動した際のコールバック
     */
    onAvailableCostUpdated(cost: number): void;
    /**
     * ゲームが終了した際のコールバック
     */
    onGameOver(isPlayerWon: boolean): void;
    /**
     * 渡されたエンティティが接敵可能か返す
     */
    shouldLockAttackableEntity(attacker: AttackableEntity, target: AttackableEntity): boolean;
    /**
     * 渡されたエンティティが攻撃可能か返す
     */
    shouldDamage(attacker: AttackableEntity, target: AttackableEntity): boolean;
    /**
     * 渡されたユニットが移動可能か返す
     */
    shouldUnitWalk(unit: UnitEntity): boolean;
}

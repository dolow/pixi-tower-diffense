import Unit from 'display/battle/Unit';
export default interface BattleManagerDelegate {
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
    shouldLock(attacker: Unit, target: Unit): boolean;
    /**
     * 渡されたユニットが攻撃可能か返す
     */
    shouldDamage(attacker: Unit, target: Unit): boolean;
    /**
     * 渡されたユニットが移動可能か返す
     */
    shouldWalk(unit: Unit): boolean;
}

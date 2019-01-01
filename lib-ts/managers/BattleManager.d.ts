import UnitMaster from 'interfaces/master/Unit';
import Unit from 'entity/actor/Unit';
export default class BattleManager {
    costRecoveryPerFrame: number;
    maxAvailableCost: number;
    onUnitsSpawned: (units: Unit[]) => void;
    onAvailableCostUpdated: (cost: number) => void;
    private currentAvailableCost;
    private units;
    private unitMasterCache;
    private requestedSpawnUnitIds;
    updateAvailableCost(newCost: number): number;
    setUnitDataMaster(unitMaster: UnitMaster[]): void;
    requestSpawn(unitId: number, isPlayer: boolean): void;
    requestSpawnPlayer(unitId: number): void;
    requestSpawnAI(unitId: number): void;
    trySpawn(unitId: number, isPlayer: boolean): Unit | null;
    isDied(unit: Unit): boolean;
    die(unit: Unit): void;
    update(_delta: number): void;
    private updateState;
    private updateAnimateState;
    private updateSpawn;
}

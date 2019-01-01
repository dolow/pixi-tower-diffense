import ResourceMaster from 'ResourceMaster';
import UnitMaster from 'interfaces/master/Unit';
import UnitState from 'enum/UnitState';
import Unit from 'entity/actor/Unit';

const INVALID_UNIT_ID = -1;

export default class BattleManager {
  public costRecoveryPerFrame: number = 0;
  public maxAvailableCost:     number = 100;
  public onUnitsSpawned: (units: Unit[]) => void = (_:Unit[]) => {};
  public onAvailableCostUpdated: (cost: number) => void = (_: number) => {};

  private currentAvailableCost: number = 0;
  private units: Unit[] = [];
  private unitMasterCache: Map<number, UnitMaster> = new Map();

  private requestedSpawnUnitIds: { unitId: number, isPlayer: boolean }[] = [];

  public updateAvailableCost(newCost: number): number {
    if (newCost > this.maxAvailableCost) {
      newCost = this.maxAvailableCost;
    }
    this.currentAvailableCost = newCost;
    this.onAvailableCostUpdated(this.currentAvailableCost);
    return this.currentAvailableCost;
  }

  public setUnitDataMaster(unitMaster: UnitMaster[]): void {
    this.unitMasterCache.clear();
    for (let i = 0; i < unitMaster.length; i++) {
      const master = unitMaster[i];
      this.unitMasterCache.set(master.unitId, master);
    }
  }

  public requestSpawn(unitId: number, isPlayer: boolean): void {
    this.requestedSpawnUnitIds.push({ unitId, isPlayer });
  }
  public requestSpawnPlayer(unitId: number): void {
    this.requestSpawn(unitId, true);
  }
  public requestSpawnAI(unitId: number): void {
    this.requestSpawn(unitId, false);
  }

  public trySpawn(unitId: number, isPlayer: boolean): Unit | null {
    const master = this.unitMasterCache.get(unitId);
    if (!master || this.currentAvailableCost < master.cost) {
      return null;
    }

    this.updateAvailableCost(this.currentAvailableCost - master.cost);

    const unit = new Unit(master, isPlayer);
    unit.id = this.units.length;
    unit.currentHealth = unit.maxHealth;
    unit.state = UnitState.IDLE;
    this.units.push(unit);
    return unit;
  }

  public isDied(unit: Unit): boolean {
    return unit.id === INVALID_UNIT_ID;
  }

  public die(unit: Unit): void {
    unit.id = INVALID_UNIT_ID;
    if (unit.sprite) {
      unit.sprite.destroy();
    }
  }

  public update(_delta: number): void {
    this.updateAvailableCost(this.currentAvailableCost + this.costRecoveryPerFrame);

    this.updateSpawn();

    // update units
    for (let i = 0; i < this.units.length;) {
      const unit = this.units[i];
      switch (unit.state) {
        case UnitState.IDLE:   {
          const direction = unit.isPlayer ? 1 : -1;
          unit.sprite.position.x += unit.speed * direction;
          break;
        }
        case UnitState.LOCKED: {
          if (!unit.isHitFrame()) {
            break;
          }
          for (let j = 0; j < this.units.length; j++) {
            const target = this.units[j];
            if (unit.isAlly(target) || !unit.isFoeContact(target)) {
              continue;
            }
            target.currentHealth -= unit.power;
          }
          break;
        }
        case UnitState.DYING:
        case UnitState.DEAD:
        default: break;
      }

      unit.updateAnimation();

      this.updateState(unit);
      this.updateAnimateState(unit);

      i++;
    }

    const newUnits = [];
    for (let i = 0; i < this.units.length; i++) {
      const unit = this.units[i];
      if (!this.isDied(unit)) {
        newUnits.push(unit);
      }
    }

    this.units = newUnits;
  }

  private updateState(unit: Unit): void {
    // DEAD > DYING > LOCKED > IDLE

    if (unit.state === UnitState.DEAD) {
      return;
    }

    if (unit.state === UnitState.DYING) {
      const maxAnimationTime = unit.getAnimationMaxFrameTime(ResourceMaster.UnitAnimationTypes.DYING);
      if (unit.animationTime === maxAnimationTime) {
        unit.state = UnitState.DEAD;
        this.die(unit);
        return;
      }
    }

    if (unit.currentHealth <= 0) {
      unit.state = UnitState.DYING;
      return;
    }

    let willLock = false;
    for (let i = 0; i < this.units.length; i++) {
      const target = this.units[i];
      if (unit.isAlly(target)) {
        continue;
      }
      if (unit.id === target.id) {
        continue;
      }

      // wysiwyg collision box
      if ((target.state === UnitState.IDLE || target.state === UnitState.LOCKED) &&
        unit.isFoeContact(target)) {
        willLock = true;
        break;
      }
    }

    unit.state = (willLock) ? UnitState.LOCKED : UnitState.IDLE;
  }

  private updateAnimateState(unit: Unit): void {
    const animationTypes = ResourceMaster.UnitAnimationTypes;
    switch (unit.state) {
      case UnitState.IDLE:   unit.setAnimationType(animationTypes.WALK);   break;
      case UnitState.LOCKED: unit.setAnimationType(animationTypes.ATTACK); break;
      case UnitState.DYING:  unit.setAnimationType(animationTypes.DYING);  break;
      case UnitState.DEAD:   unit.setAnimationType(animationTypes.DYING);  break;
      default: break;
    }
  }

  private updateSpawn(): void {
    if (this.requestedSpawnUnitIds.length === 0) {
      return;
    }

    const spawnedUnits = [];
    for (let i = 0; i < this.requestedSpawnUnitIds.length; i++) {
      const reservedUnit = this.requestedSpawnUnitIds[i];
      const unit = this.trySpawn(reservedUnit.unitId, reservedUnit.isPlayer);
      if (unit) {
        spawnedUnits.push(unit);
      }
    }

    this.requestedSpawnUnitIds = [];

    if (spawnedUnits.length === 0) {
      return;
    }

    this.onUnitsSpawned(spawnedUnits);
  }
}

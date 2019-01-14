import FieldMaster from 'interfaces/master/Field';
import AIWaveMaster from 'interfaces/master/AIWave';
import UnitMaster from 'interfaces/master/Unit';
import BaseMaster from 'interfaces/master/Base';
import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import UnitState from 'enum/UnitState';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';

const INVALID_UNIT_ID = -1;
const BASE_ENTITIES_PLAYER_INDEX = 0;
const BASE_ENTITIES_AI_INDEX = 1;

class DefaultDelegator implements BattleManagerDelegate {
  public spawnBaseEntity(_baseId: number, _isPlayer: boolean): BaseEntity | null { return null; };
  public spawnUnitEntity(_unitId: number, _isPlayer: boolean): UnitEntity | null { return null; };
  public onUnitsSpawned(_units: UnitEntity[]): void {}
  public onUnitStateChanged(_unit: UnitEntity, _oldState: number): void {}
  public onUnitUpdated(_unit: UnitEntity): void {}
  public onAvailableCostUpdated(_cost: number): void {}
  public shouldLockUnit(_attacker: UnitEntity, _target: UnitEntity): boolean { return true; }
  public shouldLockBase(_attacker: UnitEntity, _target: BaseEntity): boolean { return true; }
  public shouldDamage(_attacker: UnitEntity, _target: UnitEntity): boolean { return true; }
  public shouldUnitWalk(_unit: UnitEntity): boolean { return true }
}

/**
 * ゲーム内バトルパートのマネージャ
 * ゲームロジックを中心に扱う
 * TODO: Although GameManager is singleton, BattleManager is expected to be used by creating instance.
 * So class name should be changed.
 */
export default class BattleManager {
  /**
   * フレームごとのコスト回復量
   */
  public costRecoveryPerFrame: number = 0;
  /**
   * 利用可能コストの上限値
   */
  public maxAvailableCost: number = 100;

  /**
   * BattleManagerDelegate 実装オブジェクト
   */
  private delegator: BattleManagerDelegate = new DefaultDelegator();

  /**
   * 現在の利用可能なコスト
   */
  private availableCost: number = 0;
  /**
   * 次に割り当てるユニットID
   */
  private nextUnitId: number = 0;
  /**
   * 生成済みの Unit インスタンスを保持する配列
   */
  private units: UnitEntity[] = [];
  /**
   * 生成済みの Base インスタンスを保持する配列
   */
  private baseEntities: BaseEntity[] = [];

  private fieldMasterCache: FieldMaster | null = null;
  public getFieldMaster(): FieldMaster | null {
    return this.fieldMasterCache;
  }

  /**
   * AIWaveMaster をキャッシュするための Map
   */
  private aiWaveMasterCache: Map<number, { unitId: number }[]> = new Map();
  /**
   * UnitMaster をキャッシュするための Map
   */
  private unitMasterCache: Map<number, UnitMaster> = new Map();
  public getUnitMaster(unitId: number): UnitMaster | null {
    return this.unitMasterCache.get(unitId) || null;
  }
  /**
   * BaseMaster をキャッシュするための Map
   */
  private baseMasterCache: Map<number, BaseMaster> = new Map();

  /**
   * 外部から生成をリクエストされたユニット情報を保持する配列
   */
  private spawnRequestedUnitUnitIds: { unitId: number, isPlayer: boolean }[] = [];
  /**
   * 経過フレーム数
   */
  private passedFrameCount: number = 0;

  public init(params: {
    delegator: BattleManagerDelegate,
    aiWaveMaster: AIWaveMaster,
    fieldMaster: FieldMaster,
    unitMasters: UnitMaster[],
    baseMasterMap:{
      player: BaseMaster,
      ai: BaseMaster
    }
  }): void {
    this.delegator = params.delegator;

    this.aiWaveMasterCache.clear();
    this.baseMasterCache.clear();
    this.unitMasterCache.clear();

    this.fieldMasterCache = params.fieldMaster;

    const waves = params.aiWaveMaster.waves;
    const keys = Object.keys(waves);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.aiWaveMasterCache.set(Number.parseInt(key), waves[key]);
    }

    for (let i = 0; i < params.unitMasters.length; i++) {
      const unit = params.unitMasters[i];
      this.unitMasterCache.set(unit.unitId, unit);
    }

    this.baseMasterCache.set(params.baseMasterMap.player.baseId, params.baseMasterMap.player);
    this.baseMasterCache.set(params.baseMasterMap.ai.baseId, params.baseMasterMap.ai);

    const playerBase = this.delegator.spawnBaseEntity(params.baseMasterMap.player.baseId, true);
    const aiBase = this.delegator.spawnBaseEntity(params.baseMasterMap.ai.baseId, false);

    if (!playerBase || !aiBase) {
      throw new Error('base could not be initialized');
    }

    this.baseEntities[BASE_ENTITIES_PLAYER_INDEX] = playerBase;
    this.baseEntities[BASE_ENTITIES_AI_INDEX] = aiBase;
  }

  public setDelegator(delegator: BattleManagerDelegate): void {
    this.delegator = delegator;
  }

  /**
   * Unit 生成をリクエストする
   */
  public requestSpawn(unitId: number, isPlayer: boolean): void {
    this.spawnRequestedUnitUnitIds.push({ unitId, isPlayer });
  }
  /**
   * Unit 生成をリクエストする
   * プレイヤーユニット生成リクエストのシュガー
   */
  public requestSpawnPlayer(unitId: number): void {
    this.requestSpawn(unitId, true);
  }
  /**
   * Unit 生成をリクエストする
   * AIユニット生成リクエストのシュガー
   */
  public requestSpawnAI(unitId: number): void {
    this.requestSpawn(unitId, false);
  }

  /**
   * 渡された Unit が、ロジック上死亡扱いであるかどうかを返す
   */
  public isDied(unit: UnitEntity): boolean {
    return unit.id === INVALID_UNIT_ID;
  }

  /**
   * ゲーム更新処理
   * 外部から任意のタイミングでコールする
   */
  public update(_delta: number): void {
    this.refreshAvailableCost(this.availableCost + this.costRecoveryPerFrame);

    this.requestAISpawn(this.passedFrameCount);

    this.updateSpawnRequest();

    this.updateParameter();

    this.updateUnitState();

    for (let i = 0; i < this.units.length; i++) {
      this.delegator.onUnitUpdated(this.units[i]);
    }

    const activeUnits: UnitEntity[] = [];
    for (let i = 0; i < this.units.length; i++) {
      const unit = this.units[i];
      if (!this.isDied(unit)) {
        activeUnits.push(unit);
      }
    }

    this.units = activeUnits;

    this.passedFrameCount++;
  }

  /**
   * Unit のパラメータを更新する
   * ステートは全てのパラメータが変化した後に更新する
   */
  private updateParameter(): void {
    for (let i = 0; i < this.units.length; i++) {
      this.updateDamage(this.units[i]);
      this.updateDistance(this.units[i]);
    }
  }

  /**
   * Unit のステートを更新する
   * ステート優先順位は右記の通り DEAD > LOCKED > IDLE
   */
  private updateUnitState(): void {
    // デリゲート処理のために古いステートを保持
    const unitStates = [];
    for (let i = 0; i < this.units.length; i++) {
      unitStates.push(this.units[i].state);
    }

    for (let i = 0; i < this.units.length; i++) {
      const unit = this.units[i];
      if (unit.state === UnitState.DEAD) {
        this.updateUnitDeadState(unit);
      }
    }

    for (let i = 0; i < this.units.length; i++) {
      const unit = this.units[i];
      if (unit.state === UnitState.LOCKED) {
        this.updateUnitLockedState(unit);
      }
    }
    for (let i = 0; i < this.units.length; i++) {
      const unit = this.units[i];
      if (unit.state === UnitState.IDLE) {
        this.updateUnitIdleState(unit);
      }
    }

    for (let i = 0; i < this.units.length; i++) {
      const unit = this.units[i];
      const oldState = unitStates[i];
      if (oldState !== unit.state) {
        this.delegator.onUnitStateChanged(unit, oldState);
      }
    }
  }

  private updateDamage(unit: UnitEntity): void {
    if (!unit.lockedEntity) {
      return;
    }

    const master = this.unitMasterCache.get(unit.unitId);
    if (!master) {
      return;
    }

    if (this.delegator.shouldDamage(unit, unit.lockedEntity)) {
      unit.lockedEntity.currentHealth -= master.power;
    }
  }
  private updateDistance(unit: UnitEntity): void {
    if (unit.state !== UnitState.IDLE) {
      return;
    }

    const master = this.unitMasterCache.get(unit.unitId);
    if (!master) {
      return;
    }

    if (this.delegator.shouldUnitWalk(unit)) {
      unit.distance += master.speed;
    }
  }

  private updateUnitDeadState(_unit: UnitEntity): void {
    // NOOP
  }
  private updateUnitLockedState(unit: UnitEntity): void {
    // ロック解除判定
    if (unit.lockedEntity && unit.lockedEntity.currentHealth <= 0) {
      unit.lockedEntity = null;
      unit.state        = UnitState.IDLE;
    }

    // 自身の DEAD 判定
    if (unit.currentHealth <= 0) {
      unit.id           = INVALID_UNIT_ID;
      unit.lockedEntity = null;
      unit.state        = UnitState.DEAD;
    }
  }
  private updateUnitIdleState(unit: UnitEntity): void {
    // lock against foe unit first
    for (let i = 0; i < this.units.length; i++) {
      const target = this.units[i];
      if (unit.isAlly(target)) {
        continue;
      }
      if (target.state !== UnitState.IDLE && target.state !== UnitState.LOCKED) {
        continue;
      }

      if (this.delegator.shouldLockUnit(unit, target)) {
        unit.lockedEntity = target;
        unit.state = UnitState.LOCKED;
        break;
      }
    }

    // the lock against base
    if (!unit.lockedEntity) {
      if (unit.isPlayer) {
        const baseEntity = this.baseEntities[BASE_ENTITIES_AI_INDEX];
        if (this.delegator.shouldLockBase(unit, baseEntity)) {
          unit.lockedEntity = baseEntity;
          unit.state = UnitState.LOCKED;
        }
      } else {
        const baseEntity = this.baseEntities[BASE_ENTITIES_PLAYER_INDEX];
        if (this.delegator.shouldLockBase(unit, baseEntity)) {
          unit.lockedEntity = baseEntity;
          unit.state = UnitState.LOCKED;
        }
      }
    }
  }

  private requestAISpawn(targetFrame: number): void {
    const waves = this.aiWaveMasterCache.get(targetFrame);
    if (!waves) {
      return;
    }

    for (let i = 0; i < waves.length; i++) {
      const unitId = waves[i].unitId;
      this.requestSpawnAI(unitId);
    }
  }

  /**
   * 受け付けた Unit 生成リクエストを処理する
   * プレイヤーユニットの場合はコストを消費し、Unit 生成を試みる
   * コストが足りなければ何もしない
   */
  private updateSpawnRequest(): void {
    if (this.spawnRequestedUnitUnitIds.length === 0) {
      return;
    }

    let tmpCost = this.availableCost;

    for (let i = 0; i < this.spawnRequestedUnitUnitIds.length; i++) {
      const reservedUnit = this.spawnRequestedUnitUnitIds[i];

      const master = this.unitMasterCache.get(reservedUnit.unitId);
      if (!master) {
        continue;
      }

      if (reservedUnit.isPlayer) {
        if ((tmpCost - master.cost) < 0) {
          continue;
        }

        tmpCost -= master.cost;
      }

      const entity = this.delegator.spawnUnitEntity(reservedUnit.unitId, reservedUnit.isPlayer);
      if (entity) {
        entity.id = this.nextUnitId++;
        entity.currentHealth = master.maxHealth;
        entity.state = UnitState.IDLE;
        this.units.push(entity);
      }
    }

    this.refreshAvailableCost(tmpCost);

    this.spawnRequestedUnitUnitIds = [];
  }

  /**
   * 利用可能なコストを更新し、専用のコールバックをコールする
   */
  private refreshAvailableCost(newCost: number): number {
    if (newCost > this.maxAvailableCost) {
      newCost = this.maxAvailableCost;
    }
    this.availableCost = newCost;
    this.delegator.onAvailableCostUpdated(this.availableCost);

    return this.availableCost;
  }
}

import FieldMaster from 'interfaces/master/Field';
import AIWaveMaster from 'interfaces/master/AIWave';
import UnitMaster from 'interfaces/master/Unit';
import BaseMaster from 'interfaces/master/Base';
import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import BaseState from 'enum/BaseState';
import UnitState from 'enum/UnitState';
import BattleManagerDefaultDelegator from 'managers/BattleManagerDefaultDelegator';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';

const INVALID_UNIT_ID = -1;
const BASE_ENTITIES_PLAYER_INDEX = 0;
const BASE_ENTITIES_AI_INDEX = 1;

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
  private delegator: BattleManagerDelegate = new BattleManagerDefaultDelegator();

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
  private unitEntities: UnitEntity[] = [];
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

  /**
   * 勝敗が決まっているかどうか
   */
  private isGameOver: boolean = false;

  public init(params: {
    delegator: BattleManagerDelegate,
    aiWaveMaster: AIWaveMaster,
    fieldMaster: FieldMaster,
    unitMasters: UnitMaster[],
    baseMasterMap: {
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

    const playerBaseMaster = params.baseMasterMap.player;
    const aiBaseMaster = params.baseMasterMap.ai;

    this.baseMasterCache.set(playerBaseMaster.baseId, playerBaseMaster);
    this.baseMasterCache.set(aiBaseMaster.baseId, aiBaseMaster);

    const playerBase = this.delegator.spawnBaseEntity(playerBaseMaster.baseId, true);
    const aiBase = this.delegator.spawnBaseEntity(aiBaseMaster.baseId, false);

    if (!playerBase || !aiBase) {
      throw new Error('base could not be initialized');
    }

    playerBase.currentHealth = playerBaseMaster.maxHealth;
    aiBase.currentHealth = aiBaseMaster.maxHealth;

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
    if (!this.isGameOver) {
      this.updateGameOver();

      this.refreshAvailableCost(this.availableCost + this.costRecoveryPerFrame);

      this.requestAISpawn(this.passedFrameCount);

      this.updateSpawnRequest();

      this.updateParameter();

      this.updateUnitState();

      this.updateBaseState();
    }

    const activeUnitEntities: UnitEntity[] = [];
    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (!this.isDied(entity)) {
        activeUnitEntities.push(entity);
      }
    }

    this.unitEntities = activeUnitEntities;

    this.passedFrameCount++;
  }

  /**
   * Unit のパラメータを更新する
   * ステートは全てのパラメータが変化した後に更新する
   */
  private updateParameter(): void {
    for (let i = 0; i < this.unitEntities.length; i++) {
      this.updateDamage(this.unitEntities[i]);
      this.updateDistance(this.unitEntities[i]);
    }
  }

  /**
   * Unit のステートを更新する
   * ステート優先順位は右記の通り DEAD > LOCKED > IDLE
   */
  private updateUnitState(): void {
    const unitStates = [];
    for (let i = 0; i < this.unitEntities.length; i++) {
      unitStates.push(this.unitEntities[i].state);
    }

    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === UnitState.DEAD) {
        this.updateUnitDeadState(entity);
      }
    }

    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === UnitState.LOCKED) {
        this.updateUnitLockedState(entity);
      }
    }
    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === UnitState.IDLE) {
        this.updateUnitIdleState(entity);
      }
    }

    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      const oldState = unitStates[i];
      if (oldState !== entity.state) {
        this.delegator.onUnitStateChanged(entity, oldState);
      }
    }
  }

  /**
   * BaseEntity のステートを更新する
   */
  private updateBaseState(): void {
    let entity;

    // AI のステートを先に評価、同一フレーム内で引き分けた場合はプレーヤーの勝利
    entity = this.baseEntities[BASE_ENTITIES_AI_INDEX];
    if (entity.state !== BaseState.DEAD && entity.currentHealth <= 0) {
      entity.state = BaseState.DEAD;
      this.delegator.onBaseStateChanged(entity, BaseState.IDLE);
      return;
    }

    entity = this.baseEntities[BASE_ENTITIES_PLAYER_INDEX];
    if (entity.state !== BaseState.DEAD && entity.currentHealth <= 0) {
      entity.state = BaseState.DEAD;
      this.delegator.onBaseStateChanged(entity, BaseState.IDLE);
      return;
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
      unit.lockedEntity.currentHealth = unit.lockedEntity.currentHealth - master.power;
      this.delegator.onAttackableEntityHealthUpdated(unit, unit.lockedEntity, unit.lockedEntity.currentHealth + master.power, unit.lockedEntity.currentHealth, master.maxHealth);
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
    for (let i = 0; i < this.unitEntities.length; i++) {
      const target = this.unitEntities[i];
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

  private updateGameOver(): void {
    const isPlayerWon = this.baseEntities[BASE_ENTITIES_AI_INDEX].currentHealth <= 0;
    const isEnemyWon  = this.baseEntities[BASE_ENTITIES_PLAYER_INDEX].currentHealth <= 0;

    this.isGameOver = (isPlayerWon || isEnemyWon);

    if (this.isGameOver) {
      for (let i = 0; i < this.unitEntities.length; i++) {
        const entity = this.unitEntities[i];
        entity.state = UnitState.IDLE;
      }

      this.delegator.onGameOver(isPlayerWon);
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

      let baseEntity;
      if (reservedUnit.isPlayer) {
        if ((tmpCost - master.cost) < 0) {
          continue;
        }

        tmpCost -= master.cost;

        baseEntity = this.baseEntities[BASE_ENTITIES_PLAYER_INDEX];
      } else {
        baseEntity = this.baseEntities[BASE_ENTITIES_AI_INDEX];
      }

      const entity = this.delegator.spawnUnitEntity(reservedUnit.unitId, baseEntity, reservedUnit.isPlayer);
      if (entity) {
        entity.id = this.nextUnitId++;
        entity.currentHealth = master.maxHealth;
        entity.state = UnitState.IDLE;
        this.unitEntities.push(entity);
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

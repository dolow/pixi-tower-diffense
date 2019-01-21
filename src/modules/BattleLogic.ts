import StageMaster from 'interfaces/master/StageMaster';
import UnitMaster from 'interfaces/master/UnitMaster';
import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import AttackableState from 'enum/AttackableState';
import BattleLogicDefaultDelegator from 'modules/BattleLogicDefaultDelegator';
import UnitEntity from 'entity/UnitEntity';
import BaseEntity from 'entity/BaseEntity';

const INVALID_UNIT_ID = -1;
const BASE_ENTITIES_PLAYER_INDEX = 0;
const BASE_ENTITIES_AI_INDEX = 1;

/**
 * ゲーム内バトルパートのマネージャ
 * ゲームロジックを中心に扱う
 */
export default class BattleLogic {
  /**
   * フレームごとのコスト回復量
   */
  public costRecoveryPerFrame: number = 0;
  /**
   * 利用可能コストの上限値
   */
  public maxAvailableCost: number = 100;

  /**
   * BattleLogicDelegate 実装オブジェクト
   */
  private delegator: BattleLogicDelegate = new BattleLogicDefaultDelegator();

  /**
   * 現在の利用可能なコスト
   */
  private availableCost: number = 0;
  /**
   * 次に割り当てるエンティティID
   */
  private nextEntityId: number = 0;
  /**
   * 生成済みの Unit インスタンスを保持する配列
   */
  private unitEntities: UnitEntity[] = [];
  /**
   * 生成済みの Base インスタンスを保持する配列
   */
  private baseEntities: BaseEntity[] = [];

  /**
   * フィールドマスタのキャッシュ
   */
  private stageMasterCache: StageMaster | null = null;
  /**
   * UnitMaster をキャッシュするための Map
   */
  private unitMasterCache: Map<number, UnitMaster> = new Map();
  /**
   * StageMaster.waves をキャッシュするための Map
   */
  private aiWaveCache: Map<number, { unitId: number }[]> = new Map();
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

  /**
   * デリゲータとマスタ情報で初期化
   */
  public init(params: {
    delegator: BattleLogicDelegate,
    stageMaster: StageMaster,
    unitMasters: UnitMaster[],
    playerBase: {
      baseId: number,
      health: number
    }
  }): void {
    // デリゲータのセット
    this.delegator = params.delegator;

    // キャッシュクリア
    this.aiWaveCache.clear();
    this.unitMasterCache.clear();

    // マスターのキャッシュ処理
    this.stageMasterCache = params.stageMaster;

    const waves = this.stageMasterCache.waves;
    const keys = Object.keys(waves);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.aiWaveCache.set(Number.parseInt(key, 10), waves[key]);
    }

    for (let i = 0; i < params.unitMasters.length; i++) {
      const unit = params.unitMasters[i];
      this.unitMasterCache.set(unit.unitId, unit);
    }

    const playerBaseEntity = new BaseEntity(params.playerBase.baseId, true);
    const aiBaseEntity = new BaseEntity(this.stageMasterCache.aiBase.baseId, false);

    // 拠点エンティティの ID 割当て
    playerBaseEntity.id = this.nextEntityId++;
    aiBaseEntity.id = this.nextEntityId++;
    // 拠点エンティティの health 設定
    playerBaseEntity.currentHealth = params.playerBase.health;
    aiBaseEntity.currentHealth = this.stageMasterCache.aiBase.health;

    this.delegator.onBaseEntitySpawned(
      playerBaseEntity,
      this.stageMasterCache.playerBase.position.x
    );
    this.delegator.onBaseEntitySpawned(
      aiBaseEntity,
      this.stageMasterCache.aiBase.position.x
    );

    // 拠点エンティティの保持
    this.baseEntities[BASE_ENTITIES_PLAYER_INDEX] = playerBaseEntity;
    this.baseEntities[BASE_ENTITIES_AI_INDEX] = aiBaseEntity;
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
      // ゲーム終了判定
      this.updateGameOver();
      // コスト回復
      this.updateAvailableCost(this.availableCost + this.costRecoveryPerFrame);
      // AI ユニットの生成リクエスト発行
      this.requestAISpawn(this.passedFrameCount);
      // リクエストされているユニット生成実行
      this.updateSpawnRequest();
      // エンティティパラメータの更新
      this.updateEntityParameter();
      // エンティティのステート変更
      this.updateEntityState();
    }

    // unitEntities 配列の圧縮
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
  private updateEntityParameter(): void {
    for (let i = 0; i < this.unitEntities.length; i++) {
      this.updateDamage(this.unitEntities[i]);
      this.updateDistance(this.unitEntities[i]);
    }
  }

  /**
   * エンティティのステートを更新する
   * ステート優先順位は右記の通り DEAD > LOCKED > IDLE
   * ユニット毎に処理を行うとステートを条件にした処理結果が
   * タイミングによって異なってしまうのでステート毎に処理を行う
   */
  private updateEntityState(): void {
    // ステートの変化をコールバックするために古いステートを保持するコンテナ
    const unitStates = [];
    for (let i = 0; i < this.unitEntities.length; i++) {
      unitStates.push(this.unitEntities[i].state);
    }

    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === AttackableState.DEAD) {
        this.updateUnitDeadState(entity);
      }
    }

    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === AttackableState.LOCKED) {
        this.updateUnitLockedState(entity);
      }
    }
    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === AttackableState.IDLE) {
        this.updateUnitIdleState(entity);
      }
    }

    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      const oldState = unitStates[i];
      if (oldState !== entity.state) {
        this.delegator.onAttackableEntityStateChanged(entity, oldState);
      }
    }

    // 拠点のステート操作
    // AI のステートを先に評価、同一フレーム内で引き分けた場合はプレーヤーの勝利
    let base = this.baseEntities[BASE_ENTITIES_AI_INDEX];
    if (base.state !== AttackableState.DEAD && base.currentHealth <= 0) {
      const oldState = base.state;
      base.state = AttackableState.DEAD;
      this.delegator.onAttackableEntityStateChanged(base, oldState);
    } else {
      base = this.baseEntities[BASE_ENTITIES_PLAYER_INDEX];
      if (base.state !== AttackableState.DEAD && base.currentHealth <= 0) {
        const oldState = base.state;
        base.state = AttackableState.DEAD;
        this.delegator.onAttackableEntityStateChanged(base, oldState);
      }
    }
  }

  /**
   * ダメージ判定を行い、必要なら health を上限させる
   */
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
      this.delegator.onAttackableEntityHealthUpdated(
        unit,
        unit.lockedEntity,
        unit.lockedEntity.currentHealth + master.power,
        unit.lockedEntity.currentHealth,
        master.maxHealth
      );
    }
  }
  /**
   * 移動可能か判定し、可能なら移動させる
   */
  private updateDistance(unit: UnitEntity): void {
    if (unit.state !== AttackableState.IDLE) {
      return;
    }

    const master = this.unitMasterCache.get(unit.unitId);
    if (!master) {
      return;
    }

    if (this.delegator.shouldUnitWalk(unit)) {
      unit.distance += master.speed;
      this.delegator.onUnitEntityWalked(unit);
    }
  }

  /**
   * 死亡時のステート更新処理
   */
  private updateUnitDeadState(unit: UnitEntity): void {
    unit.id = INVALID_UNIT_ID;
  }
  /**
   * 接敵時のステート更新処理
   */
  private updateUnitLockedState(unit: UnitEntity): void {
    // ロック解除判定
    if (unit.lockedEntity && unit.lockedEntity.currentHealth <= 0) {
      unit.lockedEntity = null;
      unit.state        = AttackableState.IDLE;
    }

    // 自身の DEAD 判定
    if (unit.currentHealth <= 0) {
      unit.lockedEntity = null;
      unit.state        = AttackableState.DEAD;
    }
  }
  /**
   * 何もしていない状態でのステート更新処理
   */
  private updateUnitIdleState(unit: UnitEntity): void {
    // ユニットに対しての接敵判定、ユニットを無視して拠点に攻撃させない
    for (let i = 0; i < this.unitEntities.length; i++) {
      const target = this.unitEntities[i];
      if (unit.isAlly(target)) {
        continue;
      }
      if (target.state !== AttackableState.IDLE && target.state !== AttackableState.LOCKED) {
        continue;
      }

      if (this.delegator.shouldLockAttackableEntity(unit, target)) {
        unit.lockedEntity = target;
        unit.state = AttackableState.LOCKED;
        break;
      }
    }

    // 拠点に対しての接敵判定
    if (!unit.lockedEntity) {
      if (unit.isPlayer) {
        const baseEntity = this.baseEntities[BASE_ENTITIES_AI_INDEX];
        if (this.delegator.shouldLockAttackableEntity(unit, baseEntity)) {
          unit.lockedEntity = baseEntity;
          unit.state = AttackableState.LOCKED;
        }
      } else {
        const baseEntity = this.baseEntities[BASE_ENTITIES_PLAYER_INDEX];
        if (this.delegator.shouldLockAttackableEntity(unit, baseEntity)) {
          unit.lockedEntity = baseEntity;
          unit.state = AttackableState.LOCKED;
        }
      }
    }
  }

  /**
   * バトル状況かたゲーム終了かどうかを判断する
   */
  private updateGameOver(): void {
    const isPlayerWon = this.baseEntities[BASE_ENTITIES_AI_INDEX].currentHealth <= 0;
    const isEnemyWon  = this.baseEntities[BASE_ENTITIES_PLAYER_INDEX].currentHealth <= 0;

    this.isGameOver = (isPlayerWon || isEnemyWon);

    if (this.isGameOver) {
      for (let i = 0; i < this.unitEntities.length; i++) {
        const entity = this.unitEntities[i];
        entity.state = AttackableState.IDLE;
      }

      this.delegator.onGameOver(isPlayerWon);
    }
  }

  /**
   * 必要であれば AI ユニットを生成させる
   */
  private requestAISpawn(targetFrame: number): void {
    const waves = this.aiWaveCache.get(targetFrame);
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

    if (!this.stageMasterCache) {
      return;
    }

    let tmpCost = this.availableCost;

    for (let i = 0; i < this.spawnRequestedUnitUnitIds.length; i++) {
      const reservedUnit = this.spawnRequestedUnitUnitIds[i];

      const master = this.unitMasterCache.get(reservedUnit.unitId);
      if (!master) {
        continue;
      }

      let basePosition;
      if (reservedUnit.isPlayer) {
        if ((tmpCost - master.cost) < 0) {
          continue;
        }

        tmpCost -= master.cost;

        basePosition = this.stageMasterCache.playerBase.position.x;
      } else {
        basePosition = this.stageMasterCache.aiBase.position.x;
      }

      const entity = new UnitEntity(reservedUnit.unitId, reservedUnit.isPlayer);
      entity.id = this.nextEntityId++;
      entity.currentHealth = master.maxHealth;
      entity.state = AttackableState.IDLE;
      this.unitEntities.push(entity);

      this.delegator.onUnitEntitySpawned(entity, basePosition);
    }

    this.updateAvailableCost(tmpCost);

    this.spawnRequestedUnitUnitIds = [];
  }

  /**
   * 利用可能なコストを更新し、専用のコールバックをコールする
   */
  private updateAvailableCost(newCost: number): number {
    let cost = newCost;
    if (cost > this.maxAvailableCost) {
      cost = this.maxAvailableCost;
    }
    this.availableCost = cost;
    this.delegator.onAvailableCostUpdated(this.availableCost);

    return this.availableCost;
  }
}

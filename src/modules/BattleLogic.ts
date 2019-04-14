import StageMaster from 'interfaces/master/StageMaster';
import UnitMaster from 'interfaces/master/UnitMaster';
import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import BattleLogicConfig from 'modules/BattleLogicConfig';
import AttackableState from 'enum/AttackableState';
import BattleLogicDefaultDelegator from 'modules/BattleLogicDefaultDelegator';
import AttackableEntity from 'entity/AttackableEntity';
import UnitEntity from 'entity/UnitEntity';
import CastleEntity from 'entity/CastleEntity';

// 拠点配列のプレイヤー拠点要素のインデックス
const CASTLE_ENTITIES_PLAYER_INDEX = 0;
// 拠点配列のAI拠点要素のインデックス
const CASTLE_ENTITIES_AI_INDEX = 1;

/**
 * ゲーム内バトルパートのマネージャ
 * ゲームロジックを中心に扱う
 */
export default class BattleLogic {
  /**
   * バトル設定
   */
  private config: BattleLogicConfig = Object.freeze(new BattleLogicConfig());

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
   * 生成済みの Castle インスタンスを保持する配列
   */
  private castleEntities: CastleEntity[] = [];

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
  private spawnRequestedUnitUnitIds: {
    unitId: number,
    isPlayer: boolean
  }[] = [];
  /**
   * 経過フレーム数
   */
  private passedFrameCount: number = 0;

  /**
   * 勝敗が決まっているかどうか
   */
  private isGameOver: boolean = false;

  /**
   * プレイヤー情報
   */
  private player: {
    unitIds: number[],
    castle: {
      id: number,
      health: number
    };
  } = {
    unitIds: [],
    castle: {
      id: -1,
      health: 0
    }
  };

  /**
   * デリゲータとマスタ情報で初期化
   */
  public init(params: {
    delegator: BattleLogicDelegate,
    stageMaster: StageMaster,
    unitMasters: UnitMaster[],
    player: {
      unitIds: number[],
      castle: {
        id: number,
        health: number
      }
    },
    config?: BattleLogicConfig
  }): void {
    if (params.config) {
      this.config = Object.freeze(params.config);
    }
    // デリゲータのセット
    this.delegator = params.delegator;
    this.player = params.player;

    // キャッシュクリア
    this.aiWaveCache.clear();
    this.unitMasterCache.clear();

    // マスターのキャッシュ処理
    this.stageMasterCache = params.stageMaster;

    // AI生成情報のキャッシュ
    const waves = this.stageMasterCache.waves;
    const keys = Object.keys(waves);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.aiWaveCache.set(Number.parseInt(key, 10), waves[key]);
    }

    // ユニット情報のキャッシュ
    for (let i = 0; i < params.unitMasters.length; i++) {
      const unit = params.unitMasters[i];
      this.unitMasterCache.set(unit.unitId, unit);
    }

    const aiCastle = this.stageMasterCache.aiCastle;

    const playerCastleEntity = new CastleEntity(this.player.castle.id, true);
    const aiCastleEntity = new CastleEntity(aiCastle.castleId, false);

    // 拠点エンティティの ID 割当て
    playerCastleEntity.id = this.nextEntityId++;
    aiCastleEntity.id = this.nextEntityId++;
    // 拠点エンティティの health 設定
    playerCastleEntity.maxHealth = this.player.castle.health;
    aiCastleEntity.maxHealth = aiCastle.health;
    playerCastleEntity.currentHealth = this.player.castle.health;
    aiCastleEntity.currentHealth = aiCastle.health;

    // 拠点エンティティの保持
    this.castleEntities[CASTLE_ENTITIES_PLAYER_INDEX] = playerCastleEntity;
    this.castleEntities[CASTLE_ENTITIES_AI_INDEX] = aiCastleEntity;

    // デリゲータに拠点エンティティが生成時の処理を行わせる
    this.delegator.onCastleEntitySpawned(
      playerCastleEntity,
      this.stageMasterCache.playerCastle.position.x
    );
    this.delegator.onCastleEntitySpawned(
      aiCastleEntity,
      this.stageMasterCache.aiCastle.position.x
    );
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
   * ゲーム更新処理
   * 外部から任意のタイミングでコールする
   */
  public update(): void {
    if (!this.isGameOver) {
      // ゲーム終了判定
      this.updateGameOver();
      // コスト回復
      this.updateAvailableCost(this.availableCost + this.config.costRecoveryPerFrame);
      // AI ユニットの生成リクエスト発行
      this.updateAISpawn();
      // リクエストされているユニット生成実行
      this.updateSpawnRequest();
      // エンティティパラメータの更新
      this.updateEntityParameter();
      // エンティティのステート変更
      this.updateEntityState();
    }

    this.updatePostProcess();

    this.passedFrameCount++;
  }

  /**
   * メインループ後処理
   */
  private updatePostProcess(): void {
    // unitEntities 配列の圧縮
    const activeUnitEntities: UnitEntity[] = [];
    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      //if (!this.isDied(entity)) {
      if (entity.state !== AttackableState.DEAD) {
        activeUnitEntities.push(entity);
      }
    }

    this.unitEntities = activeUnitEntities;

    // 現在フレームで受けたダメージをリセット
    for (let i = 0; i < this.unitEntities.length; i++) {
      this.unitEntities[i].currentFrameDamage = 0;
    }
  }

  /**
   * Unit のパラメータを更新する
   * ステートは全てのパラメータが変化した後に更新する
   */
  private updateEntityParameter(): void {
    for (let i = 0; i < this.unitEntities.length; i++) {
      const unit = this.unitEntities[i];
      const master = this.unitMasterCache.get(unit.unitId);
      if (!master) {
        continue;
      }

      this.updateDamage(unit, master);
      this.updateDistance(unit, master);
    }
  }

  /**
   * エンティティのステートを更新する
   * ステート優先順位は右記の通り DEAD > KNOCK_BACK > ENGAGED > IDLE
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
      if (entity.state === AttackableState.KNOCK_BACK) {
        this.updateUnitKnockBackState(entity);
      }
    }

    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === AttackableState.ENGAGED) {
        this.updateUnitEngagedState(entity);
      }
    }
    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      if (entity.state === AttackableState.IDLE) {
        this.updateUnitIdleState(entity);
      }
    }

    // エンティティ毎にステートが変更時処理をデリゲータに委譲する
    for (let i = 0; i < this.unitEntities.length; i++) {
      const entity = this.unitEntities[i];
      const oldState = unitStates[i];
      if (oldState !== entity.state) {
        this.delegator.onAttackableEntityStateChanged(entity, oldState);
      }
    }

    // 拠点のステート操作
    // AI のステートを先に評価、同一フレーム内で引き分けた場合はプレーヤーの勝利
    let castle = this.castleEntities[CASTLE_ENTITIES_AI_INDEX];
    if (castle.state !== AttackableState.DEAD && castle.currentHealth < 1) {
      const oldState = castle.state;
      castle.state = AttackableState.DEAD;
      this.delegator.onAttackableEntityStateChanged(castle, oldState);
    } else {
      castle = this.castleEntities[CASTLE_ENTITIES_PLAYER_INDEX];
      if (castle.state !== AttackableState.DEAD && castle.currentHealth < 1) {
        const oldState = castle.state;
        castle.state = AttackableState.DEAD;
        this.delegator.onAttackableEntityStateChanged(castle, oldState);
      }
    }
  }

  /**
   * ダメージ判定を行い、必要に応じて以下を更新する。
   * - currentHealth
   * - currentFrameDamage
   */
  private updateDamage(unit: UnitEntity, master: UnitMaster): void {
    if (!unit.engagedEntity) {
      return;
    }

    // ダメージを与えられるかどうかの判断をデリゲータに委譲する
    if (this.delegator.shouldDamage(unit, unit.engagedEntity)) {
      const newHealth = unit.engagedEntity.currentHealth - master.power;
      unit.engagedEntity.currentFrameDamage += master.power;
      unit.engagedEntity.currentHealth = newHealth;
      // ダメージを与えた後の処理をデリゲータに委譲する
      this.delegator.onAttackableEntityHealthUpdated(
        unit,
        unit.engagedEntity,
        unit.engagedEntity.currentHealth + master.power,
        unit.engagedEntity.currentHealth,
        unit.engagedEntity.maxHealth
      );
    }
  }
  /**
   * 移動可能か判定し、必要なら以下を更新する。
   * - distance
   * - currentKnockBackFrameCount
   */
  private updateDistance(unit: UnitEntity, master: UnitMaster): void {
    if (unit.state === AttackableState.KNOCK_BACK) {
      unit.distance -= master.knockBackSpeed;
      unit.currentKnockBackFrameCount++;
      const rate = unit.currentKnockBackFrameCount / master.knockBackFrames;
      this.delegator.onUnitEntityKnockingBack(unit, rate);
    } else {
      unit.currentKnockBackFrameCount = 0;

      if (unit.state === AttackableState.IDLE) {
        unit.currentKnockBackFrameCount = 0;

        // 移動可能かどうかの判断をデリゲータに委譲する
        if (this.delegator.shouldUnitWalk(unit)) {
          unit.distance += master.speed;
          // 移動した後の処理をデリゲータに委譲する
          this.delegator.onUnitEntityWalked(unit);
        }
      }
    }
  }

  /**
   * ノックバック時のステート更新処理
   */
  private updateUnitKnockBackState(unit: UnitEntity): void {
    unit.engagedEntity = null;

    // TODO: should not read master for each entity
    const master = this.unitMasterCache.get(unit.unitId);
    if (!master) {
      return;
    }
    if (unit.currentKnockBackFrameCount < master.knockBackFrames) {
      return;
    }

    unit.state = (unit.currentHealth < 1) ? AttackableState.DEAD : AttackableState.IDLE;
  }
  /**
   * 接敵時のステート更新処理
   */
  private updateUnitEngagedState(unit: UnitEntity): void {
    // DEAD 判定
    if (unit.currentHealth < 1) {
      unit.engagedEntity = null;
      // ノックバックさせてから DEAD に遷移
      unit.state = AttackableState.KNOCK_BACK;
      return;
    }

    // IDLE 判定
    if (unit.engagedEntity) {
      const target = unit.engagedEntity;

      const targetIsDead = target.currentHealth < 1;
      const targetIsKnockingBack = target.state === AttackableState.KNOCK_BACK;

      if (targetIsDead || targetIsKnockingBack || !this.isChivalrousEngage(unit, unit.engagedEntity)) {
        unit.engagedEntity = null;
        unit.state = AttackableState.IDLE;
      }
    }

    // KNOCK_BACK 判定
    const oldHealth = unit.currentHealth + unit.currentFrameDamage;
    for (let i = 0; i < this.config.knockBackHealthThreasholds.length; i++) {
      const rate = this.config.knockBackHealthThreasholds[i];
      const threashold = unit.maxHealth * rate;
      if (unit.currentHealth >= threashold) {
        continue;
      }
      if (oldHealth >= threashold) {
        unit.engagedEntity = null;
        unit.state = AttackableState.KNOCK_BACK;
        break;
      }
    }
  }
  /**
   * 何もしていない状態でのステート更新処理
   */
  private updateUnitIdleState(unit: UnitEntity): void {
    // ユニットに対しての接敵判定、ユニットを無視して拠点に攻撃させない
    for (let i = 0; i < this.unitEntities.length; i++) {
      const target = this.unitEntities[i];
      // 味方同士ならスキップ
      if (
        (unit.isPlayer  && target.isPlayer) ||
        (!unit.isPlayer && !target.isPlayer)
      ) {
        continue;
      }
      // ターゲットが接敵可能なステートでなければスキップ
      if (
        target.state !== AttackableState.IDLE &&
        target.state !== AttackableState.ENGAGED
      ) {
        continue;
      }

      // デリゲータに接敵可能かどうかの判断を委譲する
      if (this.delegator.shouldEngageAttackableEntity(unit, target)) {
        if (this.isChivalrousEngage(unit, target)) {
          unit.engagedEntity = target;
          unit.state = AttackableState.ENGAGED;
        }
        // 必要であれば接敵後の処理をデリゲータに委譲する
        break;
      }
    }

    // 拠点に対しての接敵判定
    if (!unit.engagedEntity) {
      if (unit.isPlayer) {
        const castleEntity = this.castleEntities[CASTLE_ENTITIES_AI_INDEX];
        if (this.delegator.shouldEngageAttackableEntity(unit, castleEntity)) {
          unit.engagedEntity = castleEntity;
          unit.state = AttackableState.ENGAGED;
        }
      } else {
        const castleEntity = this.castleEntities[CASTLE_ENTITIES_PLAYER_INDEX];
        if (this.delegator.shouldEngageAttackableEntity(unit, castleEntity)) {
          unit.engagedEntity = castleEntity;
          unit.state = AttackableState.ENGAGED;
        }
      }
    }
  }

  /**
   * バトル状況からゲーム終了かどうかを判断する
   */
  private updateGameOver(): void {
    const isPlayerWon = this.isPlayerWon();
    this.isGameOver = (isPlayerWon || this.isAiWon());

    if (this.isGameOver) {
      // バトル終了の場合はすべてのユニットを待機アニメーションに変える
      for (let i = 0; i < this.unitEntities.length; i++) {
        const entity = this.unitEntities[i];
        entity.state = AttackableState.IDLE;
      }

      // バトル終了後処理をデリゲータに委譲する
      this.delegator.onGameOver(isPlayerWon);
    }
  }

  /**
   * プレイヤーが勝利しているかどうかを返す
   */
  private isPlayerWon(): boolean {
    return this.castleEntities[CASTLE_ENTITIES_AI_INDEX].currentHealth < 1;
  }
  /**
   * AI が勝利しているかどうかを返す
   */
  private isAiWon(): boolean {
    return this.castleEntities[CASTLE_ENTITIES_PLAYER_INDEX].currentHealth < 1;
  }

  /**
   * 現在のフレームに応じて AI ユニットを生成させる
   */
  private updateAISpawn(): void {
    const waves = this.aiWaveCache.get(this.passedFrameCount);
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
   */
  private updateSpawnRequest(): void {
    // 生成リクエストがなければ何もしない
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

      // ユニット生成位置を知らせるために拠点の位置を保持する
      let castleLocation;

      if (reservedUnit.isPlayer) {
        // コストが足りなければ何もしない
        if ((tmpCost - master.cost) < 0) {
          continue;
        }

        tmpCost -= master.cost;

        castleLocation = this.stageMasterCache.playerCastle.position.x;
      } else {
        castleLocation = this.stageMasterCache.aiCastle.position.x;
      }

      const entity = new UnitEntity(reservedUnit.unitId, reservedUnit.isPlayer);
      entity.id = this.nextEntityId++;
      entity.maxHealth = master.maxHealth;
      entity.currentHealth = master.maxHealth;
      entity.state = AttackableState.IDLE;
      this.unitEntities.push(entity);

      // ユニット生成後処理をデリゲータに移譲する
      this.delegator.onUnitEntitySpawned(entity, castleLocation);
    }

    this.updateAvailableCost(tmpCost);

    this.spawnRequestedUnitUnitIds = [];
  }

  /**
   * 利用可能なコストを更新し、専用のコールバックをコールする
   */
  private updateAvailableCost(newCost: number): number {
    let cost = newCost;
    if (cost > this.config.maxAvailableCost) {
      cost = this.config.maxAvailableCost;
    }
    this.availableCost = cost;

    const availablePlayerUnitIds = [];
    for (let i = 0; i < this.player.unitIds.length; i++) {
      const unitId = this.player.unitIds[i];
      const master = this.unitMasterCache.get(unitId);
      if (!master) {
        continue;
      }

      if (this.availableCost >= master.cost) {
        availablePlayerUnitIds.push(unitId);
      }
    }

    // コスト更新後処理をデリゲータに委譲する
    this.delegator.onAvailableCostUpdated(
      this.availableCost,
      this.config.maxAvailableCost,
      availablePlayerUnitIds
    );

    return this.availableCost;
  }

  /**
   * 1 対 1 での接敵かどうかを返す
   * 拠点に対しての接敵は true とする
   */
  private isChivalrousEngage(unit: UnitEntity, target: AttackableEntity): boolean {
    if (!this.config.chivalrousEngage) {
      return true;
    }

    if (!target.engagedEntity) {
      return true;
    }
    if (target.engagedEntity.id === unit.id) {
      return true;
    }
    if ((target.engagedEntity as CastleEntity).castleId !== undefined) {
      return true;
    }
    return false;
  }
}

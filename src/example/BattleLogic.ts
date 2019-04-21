import BattleLogicDelegate from 'example/BattleLogicDelegate';
import BattleLogicConfig from 'example/BattleLogicConfig';
import AttackableEntity from 'example/AttackableEntity';
import UnitEntity from 'example/UnitEntity';
import CastleEntity from 'example/CastleEntity';
import AttackableMaster from 'example/AttackableMaster';
import UnitMaster from 'example/UnitMaster';
import CastleMaster from 'example/CastleMaster';
import StageMaster from 'example/StageMaster';
import AttackableState from 'example/AttackableState';

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
  private delegator: BattleLogicDelegate | null = null;
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
  private attackableEntities: AttackableEntity[] = [];
  /**
   * UnitMaster をキャッシュするための Map
   */
  private unitMasterCache: Map<number, UnitMaster> = new Map();
  /**
   * CastleMaster をキャッシュするための Map
   */
  private castleMasterCache: Map<number, CastleMaster> = new Map();
  /**
   * フィールドマスタのキャッシュ
   */
  private stageMasterCache: StageMaster | null = null;
  /**
   * StageMaster.waves をキャッシュするための Map
   */
  private aiWaveCache: Map<number, { unitId: number }[]> = new Map();
  /**
   * 勝敗が決まっているかどうか
   */
  private isGameOver: boolean = false;
  /**
   * 経過フレーム数
   */
  private passedFrameCount: number = 0;

  /**
   * 外部から生成をリクエストされたユニット情報を保持する配列
   */
  private spawnRequestedUnitUnitIds: {
    unitId: number,
    isPlayer: boolean
  }[] = [];

  /**
   * プレイヤー情報
   */
  private player?: {
    unitIds: number[];
    castle: CastleMaster;
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
      castle: CastleMaster
    },
    ai: {
      castle: CastleMaster
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
    // 拠点マスターのキャッシュ処理
    this.castleMasterCache.set(this.player.castle.castleId, this.player.castle);
    this.castleMasterCache.set(params.ai.castle.castleId, params.ai.castle);

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

    this.spawnCastle(this.player.castle, true);
    this.spawnCastle(params.ai.castle, false);
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
   * バトル状況からゲーム終了かどうかを判断する
   */
  private updateGameOver(): void {
    let playerWon = false;
    let aiWon = false;
    for (let i = 0; i < this.attackableEntities.length; i++) {
      const entity = this.attackableEntities[i];
      if (!(entity as CastleEntity).castleId) {
        continue;
      }

      if (entity.currentHealth < 1) {
        if (entity.isPlayer) {
          aiWon = true;
        } else {
          playerWon = true;
        }
      }
    }

    this.isGameOver = (playerWon || aiWon);

    if (this.isGameOver) {
      // バトル終了の場合はすべてのユニットを待機アニメーションに変える
      for (let i = 0; i < this.attackableEntities.length; i++) {
        const entity = this.attackableEntities[i];
        if ((entity as CastleEntity).castleId) {
          continue;
        }
        entity.state = AttackableState.IDLE;
      }

      // バトル終了後処理をデリゲータに委譲する
      if (this.delegator) {
        // プレイヤーの勝利を優先する
        this.delegator.onGameOver(playerWon);
      }
    }
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

    if (this.delegator) {
      const availablePlayerUnitIds = [];
      for (let i = 0; i < this.player!.unitIds.length; i++) {
        const unitId = this.player!.unitIds[i];
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
    }

    return this.availableCost;
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

    let tmpCost = this.availableCost;

    for (let i = 0; i < this.spawnRequestedUnitUnitIds.length; i++) {
      const reservedUnit = this.spawnRequestedUnitUnitIds[i];

      const master = this.unitMasterCache.get(reservedUnit.unitId);
      if (!master) {
        continue;
      }

      if (reservedUnit.isPlayer) {
        // コストが足りなければ何もしない
        if ((tmpCost - master.cost) < 0) {
          continue;
        }
        tmpCost -= master.cost;
      }

      const entity = new UnitEntity(reservedUnit.unitId, reservedUnit.isPlayer);
      entity.id = this.nextEntityId++;
      entity.maxHealth = master.maxHealth;
      entity.currentHealth = master.maxHealth;
      entity.state = AttackableState.IDLE;
      this.attackableEntities.push(entity);

      // ユニット生成後処理をデリゲータに移譲する
      if (this.delegator) {
        this.delegator.onUnitEntitySpawned(entity);
      }
    }

    this.updateAvailableCost(tmpCost);

    this.spawnRequestedUnitUnitIds = [];
  }

  /**
   * Unit のパラメータを更新する
   * ステートは全てのパラメータが変化した後に更新する
   */
  private updateEntityParameter(): void {
    for (let i = 0; i < this.attackableEntities.length; i++) {
      const attackable = this.attackableEntities[i];
      const master = (attackable as UnitEntity).unitId
        ? this.unitMasterCache.get((attackable as UnitEntity).unitId)
        : this.castleMasterCache.get((attackable as CastleEntity).castleId);
      if (!master) {
        continue;
      }

      this.updateDamage(attackable, master);
      this.updateDistance(attackable, master);
    }
  }

  /**
   * ダメージ判定を行い、必要に応じて以下を更新する。
   * - currentHealth
   * - currentFrameDamage
   */
  private updateDamage(attackable: AttackableEntity, master: AttackableMaster): void {
    if (!attackable.engagedEntity) {
      return;
    }

    // ダメージを与えられるかどうかの判断をデリゲータに委譲する
    const shouldDamage = this.delegator ? this.delegator.shouldDamage(attackable, attackable.engagedEntity) : true;
    if (shouldDamage) {
      const newHealth = attackable.engagedEntity.currentHealth - master.power;
      attackable.engagedEntity.currentFrameDamage += master.power;
      attackable.engagedEntity.currentHealth = newHealth;
      // ダメージを与えた後の処理をデリゲータに委譲する
      if (this.delegator) {
        this.delegator.onAttackableEntityHealthUpdated(
          attackable,
          attackable.engagedEntity,
          attackable.engagedEntity.currentHealth + master.power,
          attackable.engagedEntity.currentHealth,
          attackable.engagedEntity.maxHealth
        );
      }
    }
  }

  /**
   * 移動可能か判定し、必要なら以下を更新する。
   * - distance
   * - currentKnockBackFrameCount
   */
  private updateDistance(attackable: AttackableEntity, master: AttackableMaster): void {
    if (attackable.state === AttackableState.KNOCK_BACK) {
      attackable.distance -= master.knockBackSpeed;
      attackable.currentKnockBackFrameCount++;
      if (this.delegator) {
        const rate = attackable.currentKnockBackFrameCount / master.knockBackFrames;
        this.delegator.onAttackableEntityKnockingBack(attackable, rate);
      }
    } else {
      attackable.currentKnockBackFrameCount = 0;

      if (attackable.state === AttackableState.IDLE) {
        // 移動可能かどうかの判断をデリゲータに委譲する
        if (this.delegator) {
          if (this.delegator.shouldAttackableWalk(attackable)) {
            attackable.distance += master.speed;
            // 移動した後の処理をデリゲータに委譲する
            this.delegator.onAttackableEntityWalked(attackable);
          }
        } else {
          attackable.distance += master.speed;
        }
      }
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
    for (let i = 0; i < this.attackableEntities.length; i++) {
      unitStates.push(this.attackableEntities[i].state);
    }

    for (let i = 0; i < this.attackableEntities.length; i++) {
      const entity = this.attackableEntities[i];
      if (entity.state === AttackableState.KNOCK_BACK) {
        this.updateAttackableKnockBackState(entity);
      }
    }
    for (let i = 0; i < this.attackableEntities.length; i++) {
      const entity = this.attackableEntities[i];
      if (entity.state === AttackableState.ENGAGED) {
        this.updateAttackableEngagedState(entity);
      }
    }
    for (let i = 0; i < this.attackableEntities.length; i++) {
      const entity = this.attackableEntities[i];
      if (entity.state === AttackableState.IDLE) {
        this.updateAttackableIdleState(entity);
      }
    }

    // エンティティ毎にステートが変更時処理をデリゲータに委譲する
    if (this.delegator) {
      for (let i = 0; i < this.attackableEntities.length; i++) {
        const entity = this.attackableEntities[i];
        const oldState = unitStates[i];
        if (oldState !== entity.state) {
          this.delegator.onAttackableEntityStateChanged(entity, oldState);
        }
      }
    }
  }

  /**
   * ノックバック時のステート更新処理
   */
  private updateAttackableKnockBackState(attackable: AttackableEntity): void {
    attackable.engagedEntity = null;

    // TODO: should not read master for each entity
    const master = (attackable as UnitEntity).unitId
      ? this.unitMasterCache.get((attackable as UnitEntity).unitId)
      : this.castleMasterCache.get((attackable as CastleEntity).castleId);

    if (!master) {
      return;
    }
    if (master.knockBackFrames !== 0 && attackable.currentKnockBackFrameCount < master.knockBackFrames) {
      return;
    }

    attackable.state = (attackable.currentHealth < 1) ? AttackableState.DEAD : AttackableState.IDLE;
  }
  /**
   * 接敵時のステート更新処理
   */
  private updateAttackableEngagedState(attackable: AttackableEntity): void {
    // DEAD 判定
    if (attackable.currentHealth < 1) {
      attackable.engagedEntity = null;
      // ノックバックさせてから DEAD に遷移
      attackable.state = AttackableState.KNOCK_BACK;
      return;
    }

    // IDLE 判定
    if (attackable.engagedEntity) {
      const target = attackable.engagedEntity;

      const targetIsDead = target.currentHealth < 1;
      const targetIsKnockingBack = target.state === AttackableState.KNOCK_BACK;

      if (targetIsDead || targetIsKnockingBack/* || !this.isChivalrousEngage(attackable, attackable.engagedEntity)*/) {
        attackable.engagedEntity = null;
        attackable.state = AttackableState.IDLE;
      }
    }

    // KNOCK_BACK 判定
    const oldHealth = attackable.currentHealth + attackable.currentFrameDamage;
    for (let i = 0; i < this.config.knockBackHealthThreasholds.length; i++) {
      const rate = this.config.knockBackHealthThreasholds[i];
      const threashold = attackable.maxHealth * rate;
      if (attackable.currentHealth >= threashold) {
        continue;
      }

      if (oldHealth >= threashold) {
        attackable.engagedEntity = null;
        attackable.state = AttackableState.KNOCK_BACK;
        break;
      }
    }
  }
  /**
   * 何もしていない状態でのステート更新処理
   */
  private updateAttackableIdleState(attackable: AttackableEntity): void {
    for (let i = 0; i < this.attackableEntities.length; i++) {
      const target = this.attackableEntities[i];
      // 味方同士ならスキップ
      if (
        (attackable.isPlayer  && target.isPlayer) ||
        (!attackable.isPlayer && !target.isPlayer)
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
      // TODO: implement logical condition, default true currently
      const shouldEngage = this.delegator ? this.delegator.shouldEngageAttackableEntity(attackable, target) : true;
      if (shouldEngage) {
        // if (this.isChivalrousEngage(attackable, target)) {
          attackable.engagedEntity = target;
          attackable.state = AttackableState.ENGAGED;
        // }
        // 必要であれば接敵後の処理をデリゲータに委譲する
        break;
      }
    }
  }

  /**
   * メインループ後処理
   */
  private updatePostProcess(): void {
    // attackableEntities 配列の圧縮
    const activeAttackableEntities: AttackableEntity[] = [];
    for (let i = 0; i < this.attackableEntities.length; i++) {
      const entity = this.attackableEntities[i];
      if (entity.state !== AttackableState.DEAD) {
        activeAttackableEntities.push(entity);
      }
    }

    this.attackableEntities = activeAttackableEntities;

    // 現在フレームで受けたダメージをリセット
    for (let i = 0; i < this.attackableEntities.length; i++) {
      this.attackableEntities[i].currentFrameDamage = 0;
    }
  }

  private spawnCastle(castle: CastleMaster, isPlayer: boolean): CastleEntity {
    const entity = new CastleEntity(castle, isPlayer);
    // 拠点エンティティの ID 割当て
    entity.id = this.nextEntityId++;
    entity.state = AttackableState.IDLE;
    this.attackableEntities.push(entity);

    // デリゲータに拠点エンティティが生成時の処理を行わせる
    if (this.delegator) {
      this.delegator.onCastleEntitySpawned(entity, isPlayer);
    }

    return entity;
  }
}

import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';
import UpdateObject from 'interfaces/UpdateObject';
import BattleLogicDelegate from 'example/BattleLogicDelegate';
import CastleMaster from 'interfaces/master/CastleMaster';
import UnitAnimationMaster from 'interfaces/master/UnitAnimationMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import UnitButton from 'example/UnitButton';
import AttackableEntity from 'example/AttackableEntity';
import CastleEntity from 'example/CastleEntity';
import UnitEntity from 'example/UnitEntity';
import AttackableState from 'example/AttackableState';
import Attackable from 'example/Attackable';
import Castle from 'example/Castle';
import Unit from 'example/Unit';
import UiNodeFactory from 'example/factory/UiNodeFactory';
import UnitButtonFactory from 'example/factory/UnitButtonFactory';
import BattleSceneState from 'example/BattleSceneState';
import BattleLogic from 'example/BattleLogic';
import BattleLogicConfig from 'example/BattleLogicConfig';
import Field from 'example/Field';

/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleLogic に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleLogicDelegate {
  /**
   * ステージの長さに対する拠点座標のオフセット
   */
  private static readonly castleXOffset: number = 200;
  /**
   * UI Graph ユニットボタンのキープリフィックス
   */
  private static readonly unitButtonPrefix: string = 'unit_button_';

  /**
   * このシーンのステート
   */
  private state!: number;
  /**
   * 編成したユニットID配列
   */
  private unitIds!: number[];
  /**
   * 編成した拠点パラメータ
   */
  private playerCastle!: CastleMaster;
  /**
   * 編成したユニットID配列
   */
  private stageId!: number;
  /**
   * ユニット編成数
   */
  private unitSlotCount!: number;
  /**
   * ゲームロジックを処理する BattleLogic のインスタンス
   */
  private battleLogic!: BattleLogic;
  /**
   * BattleLogic 用の設定
   */
  private battleLogicConfig!: BattleLogicConfig;

  /**
   * ユニットアニメーションマスターのキャッシュ
   */
  private unitAnimationMasterCache: Map<number, UnitAnimationMaster>
    = new Map();

  /**
   * Field インスタンス
   */
  private field: Field = new Field();

  /**
   * エンティティの ID で紐付けられた有効な Unit インスタンスのマップ
   */
  private attackables: Map<number, Attackable> = new Map();

  /**
   * コンストラクタ
   */
  constructor() {
    super();

    this.stageId = 1;
    this.unitIds = [1,2,3,4,5];
    this.playerCastle = {
      castleId:  1,
      cost:      0,
      maxHealth: 100,
      power:     0,
      speed:     0,
      knockBackFrames: 0,
      knockBackSpeed:  0
    };
    this.unitSlotCount = 5;
    this.interactive = true;

    // デフォルトのシーンステート
    this.state = BattleSceneState.LOADING_RESOURCES;

    // BattleLogic インスタンスの作成
    this.battleLogic = new BattleLogic();
    this.battleLogicConfig = new BattleLogicConfig({
      costRecoveryPerFrame: 0.1,
      maxAvailableCost: 100
    });
  }

  /**
   * Scene クラスメソッドオーバーライド
   */
  protected createInitialResourceList(): (string | LoaderAddParam)[] {
    return super.createInitialResourceList().concat(
      Field.resourceList,
      [
        Resource.Api.Stage(this.stageId),
        Resource.Dynamic.Castle(this.playerCastle.castleId)
      ]
    );
  }

  /**
   * リソースロード完了コールバック
   * BattleLogic にユニットマスタ情報を渡し、フィールドやユニットボタンの初期化を行う
   */
  protected onInitialResourceLoaded(): (LoaderAddParam | string)[] {
    const additionalAssets = super.onInitialResourceLoaded();

    const resources = PIXI.loader.resources as any;
    const stageMaster = resources[Resource.Api.Stage(this.stageId)].data;

    additionalAssets.push(Resource.Dynamic.Castle(stageMaster.aiCastleId));

    // ユーザの編成で指定されたユニット ID 配列に敵のユニット ID を追加する
    const keys = Object.keys(stageMaster.waves);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const wave = stageMaster.waves[key];
      for (let j = 0; j < wave.length; j++) {
        const unitId = wave[j].unitId;
        if (this.unitIds.indexOf(unitId) === -1) {
          this.unitIds.push(unitId);
        }
      }
    }

    additionalAssets.push(Resource.Api.Castle([stageMaster.aiCastleId]));
    additionalAssets.push(Resource.Api.UnitAnimation(this.unitIds));

    for (let i = 0; i < this.unitIds.length; i++) {
      const unitId = this.unitIds[i];
      additionalAssets.push(Resource.Dynamic.UnitPanel(unitId));
      additionalAssets.push(Resource.Dynamic.Unit(unitId));
    }

    additionalAssets.push(Resource.Api.Unit(this.unitIds));

    return additionalAssets;
  }

  /**
   * リソースロード完了時のコールバック
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const resources = PIXI.loader.resources as any;

    const stageMaster  = resources[Resource.Api.Stage(this.stageId)].data;
    const castleMaster = resources[Resource.Api.Castle([stageMaster.aiCastleId])].data;
    const unitMasters  = resources[Resource.Api.Unit(this.unitIds)].data;

    const aiCastleMasters = castleMaster.filter((master: CastleMaster) => {
      return master.castleId === stageMaster.aiCastleId;
    });

    if (aiCastleMasters.length === 0) {
      throw new Error('could not retrieve ai castle master data');
    }

    const animationKey = Resource.Api.UnitAnimation(this.unitIds);
    const unitAnimationMasters = resources[animationKey].data;
    for (let i = 0; i < unitAnimationMasters.length; i++) {
      const master = unitAnimationMasters[i];
      this.unitAnimationMasterCache.set(master.unitId, master);
    }

    this.field.init({
      fieldLength: stageMaster.length,
      zLines: stageMaster.zLines
    });
    this.initUnitButtons();
    this.addChild(this.field);
    this.addChild(this.uiGraphContainer);

    this.battleLogic.init({
      stageMaster,
      unitMasters,
      delegator: this,
      player: {
        unitIds: this.unitIds,
        castle: this.playerCastle
      },
      ai: {
        castle: aiCastleMasters[0]
      },
      config: this.battleLogicConfig
    });

    if (this.transitionIn.isFinished()) {
      this.state = BattleSceneState.READY;
    } else {
      this.state = BattleSceneState.RESOURCE_LOADED;
    }
  }

  /**
   * トランジション開始処理
   * トランジション終了で可能ならステートを変更する
   */
  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void {
    super.beginTransitionIn(() => {
      // リソースもロードされていれば READY ステートに変更する
      if (this.state === BattleSceneState.RESOURCE_LOADED) {
        this.state = BattleSceneState.READY;
        onTransitionFinished(this);
      }
    });
  }

  /**
   * 独自 UiGraph 要素のファクトリを返す
   * BattleScene は UnitButton を独自で定義している
   */
  protected getCustomUiGraphFactory(type: string): UiNodeFactory | null {
    if (type === 'unit_button') {
      return new UnitButtonFactory();
    }
    return null;
  }

  /**
   * 毎フレームの更新処理
   * シーンのステートに応じて処理する
   */
  public update(delta: number) {
    switch (this.state) {
      case BattleSceneState.LOADING_RESOURCES: break;
      case BattleSceneState.READY: {
        this.state = BattleSceneState.INGAME;
        break;
      }
      case BattleSceneState.INGAME:
      case BattleSceneState.FINISHED: {
        this.battleLogic.update();
        break;
      }
    }

    this.updateRegisteredObjects(delta);
  }

  /**
   * CastleEntity が生成されたときのコールバック
   */
  public onCastleEntitySpawned(entity: CastleEntity, isPlayer: boolean): void {
    const stageMaster = PIXI.loader.resources[Resource.Api.Stage(this.stageId)].data;

    // 拠点の描画物を生成する
    const castle = new Castle(entity.castleId, {
      x: (isPlayer)
        ? BattleScene.castleXOffset
        : stageMaster.length - BattleScene.castleXOffset,
      y: 300
    });

    if (!entity.isPlayer) {
      castle.sprite.scale.x = -1.0;
    }

    this.attackables.set(entity.id, castle);

    this.field.addChildToZLine(castle.sprite, 0);

    this.registerUpdatingObject(castle as UpdateObject);
  }

  /**
   * UnitEntity が生成されたときのコールバック
   * id に紐つけて表示物を生成する
   */
  public onUnitEntitySpawned(entity: UnitEntity): void {
    const animationMaster = this.unitAnimationMasterCache.get(entity.unitId);
    if (!animationMaster) {
      return;
    }

    const stageMaster = PIXI.loader.resources[Resource.Api.Stage(this.stageId)].data;
    const zLineIndex = Math.floor(Math.random() * this.field.zLineCount);

    const unit = new Unit(animationMaster, {
      x: (entity.isPlayer)
        ? BattleScene.castleXOffset
        : stageMaster.length - BattleScene.castleXOffset,
      y: 300 + zLineIndex * 16
    });
    unit.sprite.scale.x = (entity.isPlayer) ? 1.0 : -1.0;
    unit.requestAnimation(Resource.AnimationTypes.Unit.WALK);

    this.attackables.set(entity.id, unit);
    this.field.addChildToZLine(unit.sprite, zLineIndex);
    this.registerUpdatingObject(unit as UpdateObject);
  }

  /**
   * 利用可能なコストの値が変動したときのコールバック
   */
  public onAvailableCostUpdated(
    cost: number,
    maxCost: number,
    availablePlayerUnitIds: number[]
  ): void {
    const text = `${Math.floor(cost)}/${maxCost}`;
    (this.uiGraph.cost_text as PIXI.Text).text = text;

    // コストに応じてUnitButton のフィルタを切り替える
    for (let index = 0; index < this.unitSlotCount; index++) {
      const unitButton = this.getUiGraphUnitButton(index);
      if (!unitButton) {
        continue;
      }

      const enbaleFilter = (availablePlayerUnitIds.indexOf(unitButton.unitId) === -1);
      unitButton.toggleFilter(enbaleFilter);
    }
  }

  /**
   * エンティティのステートが変更された際のコールバック
   */
  public onAttackableEntityStateChanged(
    entity: AttackableEntity,
    _oldState: number
  ): void {
    const attackable = this.attackables.get(entity.id);
    if (!attackable) {
      return;
    }

    if ((entity as UnitEntity).unitId) {
      const unit = attackable as Unit;
      const animationTypes = Resource.AnimationTypes.Unit;
      switch (entity.state) {
        case AttackableState.IDLE: {
          unit.requestAnimation(animationTypes.WALK);
          break;
        }
        case AttackableState.ENGAGED: {
          unit.requestAnimation(animationTypes.ATTACK);
          break;
        }
        case AttackableState.KNOCK_BACK: {
          unit.requestAnimation(animationTypes.DAMAGE);
          break;
        }
        case AttackableState.DEAD: {
          attackable.destroy();
          break;
        }
        default: break;
      }
    }
  }

  /**
   * 渡された UnitEntity の distance が変化した時に呼ばれる
   */
  public onAttackableEntityWalked(entity: AttackableEntity): void {
    const attackable = this.attackables.get(entity.id);
    if (!attackable) {
      return;
    }
    const direction = entity.isPlayer ? 1 : -1;

    const visualDistance = entity.distance * direction;
    attackable.sprite.position.x = attackable.distanceBasePosition.x + visualDistance;
  }

  /**
   * 渡された UnitEntity がノックバック中に呼ばれる
   */
  public onAttackableEntityKnockingBack(
    entity: AttackableEntity,
    _knockBackRate: number
  ): void {
    const attackable = this.attackables.get(entity.id);
    if (!attackable) {
      return;
    }
    const unit = attackable as Unit;
    const direction = entity.isPlayer ? 1 : -1;

    const physicalDistance = entity.distance * direction;
    const spawnedPosition = unit.distanceBasePosition;

    unit.sprite.position.x = spawnedPosition.x + physicalDistance;

    //const leap = (knockBackRate >= 1) ? 0 : -Math.sin(knockBackRate * Math.PI);
    //unit.sprite.position.y = spawnedPosition.y + (leap * BattleScene.unitLeapHeight);
  }

  /**
   * 渡されたエンティティの health が増減した場合に呼ばれる
   */
  public onAttackableEntityHealthUpdated(
    _attacker: AttackableEntity,
    _target: AttackableEntity,
    _fromHealth: number,
    _toHealth: number,
    _maxHealth: number
  ): void {

  }

  /**
   * 渡されたエンティティ同士が攻撃可能か返す
   */
  public shouldDamage(
    attackerEntity: AttackableEntity,
    targetEntity: AttackableEntity
  ): boolean {
    const attackerAttackable = this.attackables.get(attackerEntity.id);
    if (!attackerAttackable) {
      return false;
    }
    const targetAttackable = this.attackables.get(targetEntity.id);
    if (!targetAttackable) {
      return false;
    }
    if (!(attackerEntity as UnitEntity).unitId) {
      return false;
    }

    const unit = attackerAttackable as Unit;

    if (!unit.isHitFrame()) {
      return false;
    }

    return unit.isFoeContact(targetAttackable.sprite);
  }

  /**
   * 渡されたユニットが移動すべきかどうかを返す
   */
  public shouldAttackableWalk(entity: AttackableEntity): boolean {
    const attackable = this.attackables.get(entity.id);
    if (!attackable) {
      return false;
    }
    if (!(entity as UnitEntity).unitId) {
      return false;
    }

    if (attackable.animationType === Resource.AnimationTypes.Unit.WALK) {
      return true;
    }
    return (attackable as Unit).isAnimationLastFrameTime();
  }

  /**
   * 渡されたエンティティ同士が接敵可能か返す
   */
  public shouldEngageAttackableEntity(
    attacker: AttackableEntity,
    target: AttackableEntity
  ): boolean {
    const attackerAttackable = this.attackables.get(attacker.id);
    if (!attackerAttackable) {
      return false;
    }
    const targetAttackable = this.attackables.get(target.id);
    if (!targetAttackable) {
      return false;
    }

    return attackerAttackable.isFoeContact(targetAttackable.sprite);
  }

  /**
   * UnitButton 用のコールバック
   * タップされたボタンに応じたユニットの生成を BattleLogic にリクエストする
   */
  public onUnitButtonTapped(buttonIndex: number): void {
    if (this.state !== BattleSceneState.INGAME) {
      return;
    }

    const unitButton = this.getUiGraphUnitButton(buttonIndex);
    if (unitButton) {
      this.battleLogic.requestSpawnPlayer(unitButton.unitId);
    }
  }

  /**
   * ボタンインデックスから UnitButton インスタンスを返す
   */
  private getUiGraphUnitButton(index: number): UnitButton | undefined {
    const uiGraphUnitButtonName = `${BattleScene.unitButtonPrefix}${index + 1}`;
    return this.uiGraph[uiGraphUnitButtonName] as UnitButton;
  }

  /**
   * ユニットボタンの初期化
   */
  private initUnitButtons(): void {
    const key = Resource.Api.Unit(this.unitIds);
    const unitMasters = PIXI.loader.resources[key].data;
    for (let index = 0; index < this.unitSlotCount; index++) {
      const unitButton = this.getUiGraphUnitButton(index);
      if (!unitButton) {
        continue;
      }

      let cost = -1;

      const unitId = this.unitIds[index];
      if (unitId > 0) {
        for (let j = 0; j < unitMasters.length; j++) {
          const unitMaster = unitMasters[j];
          if (unitMaster.unitId === unitId) {
            cost = unitMaster.cost;
            break;
          }
        }
      }

      unitButton.init(index, unitId, cost);
      unitButton.toggleFilter(true);
    }
  }
}

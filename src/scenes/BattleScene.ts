import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import BaseState from 'enum/BaseState';
import UnitState from 'enum/UnitState';
import GameManager from 'managers/GameManager';
import BattleManager from 'managers/BattleManager';
import SoundManager from 'managers/SoundManager';
import Scene from 'scenes/Scene';
import TitleScene from 'scenes/TitleScene';
import FadeIn from 'scenes/transition/FadeIn';
import FadeOut from 'scenes/transition/FadeOut';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UnitButtonFactory from 'modules/UiNodeFactory/battle/UnitButtonFactory';
import AttackableEntity from 'entity/AttackableEntity';
import BaseEntity from 'entity/BaseEntity';
import UnitEntity from 'entity/UnitEntity';
import UnitButton from 'display/battle/UnitButton';
import Unit from 'display/battle/Unit';
import Field from 'display/battle/Field';
import Base from 'display/battle/Base';
import Dead from 'display/battle/effect/Dead';
import CollapseExplodeEffect from 'display/battle/effect/CollapseExplodeEffect';
import BattleResult from 'display/battle/effect/BattleResult';

const debugMaxUnitCount = 5;
const debugField: number = 1;
const debugStage: number = 1;
const debugUnits: number[] = [1, -1, 3, -1, 5];
const debugBaseIdMap = {
  player: 1,
  ai: 2
};
const debugPlayerBaseParams = {
  maxHealth: 100
};
const debugCostRecoveryPerFrame = 0.05;
const debugMaxAvailableCost     = 100;

/**
 * BattleScene のステートのリスト
 */
const BattleState = Object.freeze({
  LOADING_RESOURCES: 1,
  RESOURCE_LOADED: 2,
  READY: 3,
  INGAME: 4,
  FINISHED: 5
});

/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleManager に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleManagerDelegate {

  private static battleBgmKey: string = 'battle_bgm';

  /**
   * 最大ユニット編成数
   */
  private maxUnitSlotCount!: number;

  /**
   * 利用するフィールドID
   */
  private fieldId!: number;
  /**
   * 挑戦するステージID
   */
  private stageId!: number;
  /**
   * 編成した拠点パラメータ
   */
  private playerBaseParams!: { maxHealth: number; };
  /**
   * 編成したユニットID配列
   */
  private unitIds!: number[];

  /**
   * 指定された拠点ID
   */
  private baseIdMap!: {
    player: number;
    ai: number;
  };
  /**
   * このシーンのステート
   */
  private state!: number;
  /**
   * ゲームロジックを処理する BattleManager のインスタンス
   */
  private manager!: BattleManager;
  /**
   * 背景の PIXI.Container
   */
  private field!: Field;

  /**
   * 削除予定のコンテナ
   */
  private destroyList: PIXI.Container[] = [];

  /**
   * GameManagerDelegate 実装
   * Base を発生させるときのコールバック
   * Field に Base のスプライトを追加する
   */
  public spawnBaseEntity(baseId: number, isPlayer: boolean): BaseEntity | null {
    const fieldMaster = this.manager.getFieldMaster();
    if (!fieldMaster) {
      return null;
    }

    const base = new Base(baseId, isPlayer);

    if (isPlayer) {
      base.init({ x: fieldMaster.playerBase.position.x });
    } else {
      base.init({ x: fieldMaster.aiBase.position.x });
    }

    this.field.addChildAsForeBackgroundEffect(base.sprite);

    return base;
  };

  /**
   * GameManagerDelegate 実装
   * Unit を発生させるときのコールバック
   * Field に Unit のスプライトを追加する
   */
  public spawnUnitEntity(unitId: number, baseEntity: BaseEntity, isPlayer: boolean): UnitEntity | null {
    const master = this.manager.getUnitMaster(unitId);
    if (!master) {
      return null;
    }

    const unit = new Unit(unitId, isPlayer, {
      hitFrame: master.hitFrame,
      animationMaxFrameIndexes: master.animationMaxFrameIndexes,
      animationUpdateDurations: master.animationUpdateDurations
    });

    unit.sprite.position.x = (baseEntity as Base).sprite.position.x;

    this.field.addChildToRandomZLine(unit.sprite);

    unit.saveSpawnedPosition();

    (baseEntity as Base).setAnimation(ResourceMaster.Base.AnimationTypes.SPAWN);

    return unit;
  }

  /**
   * GameManagerDelegate 実装
   * 拠点のステートが変更された際のコールバック
   */
  public onBaseStateChanged(entity: BaseEntity, _oldState: number): void {
    if (entity.state === BaseState.DEAD) {
      const base = (entity as Base)
      base.setAnimation(ResourceMaster.Base.AnimationTypes.COLLAPSE);
      this.field.addChildAsForeForegroundEffect(base.explodeContainer);
    }
  }

  /**
  * GameManagerDelegate 実装
   * ユニットのステートが変更された際のコールバック
   */
  public onUnitStateChanged(entity: UnitEntity, _oldState: number): void {
    (entity as Unit).resetAnimation();
  }

  /**
   * GameManagerDelegate 実装
   * Base が更新されたときのコールバック
   * Base のアニメーションと PIXI による描画を更新する
   */
  public onBaseUpdated(base: BaseEntity): void {
    (base as Base).updateAnimation();
  };

  /**
   * GameManagerDelegate 実装
   * Unit が更新されたときのコールバック
   * Unit のアニメーションと PIXI による描画を更新する
   */
  public onUnitUpdated(entity: UnitEntity): void {
    const unit = entity as Unit;

    const animationTypes = ResourceMaster.Unit.AnimationTypes;
    let animationType = unit.getAnimationType();

    switch (unit.state) {
      case UnitState.IDLE: {
        if (animationType !== animationTypes.WALK) {
          if (unit.isAnimationLastFrameTime()) {
            animationType = animationTypes.WALK;
            unit.resetAnimation();
          }
        } else {
          unit.sprite.position.x = unit.getSpawnedPosition().x + unit.distance * (unit.isPlayer ? 1 : -1);
        }
        break;
      }
      case UnitState.LOCKED: {
        animationType = animationTypes.ATTACK;
        break;
      }
      case UnitState.DEAD: {
        const effect = new Dead(!unit.isPlayer);
        effect.position.set(unit.sprite.position.x, unit.sprite.position.y);
        this.field.addChildAsForeBackgroundEffect(effect);
        this.registerUpdatingObject(effect);

        if (unit.sprite) {
          this.destroyList.push(unit.sprite);
        }
        break;
      }
      default: break;
    }

    if (animationType) {
      unit.updateAnimation(animationType);
    }
  }
  /**
   * GameManagerDelegate 実装
   * 利用可能なコストの値が変動したときのコールバック
   */
  public onAvailableCostUpdated(cost: number): void {
    (this.uiGraph.cost_text as PIXI.Text).text = `${Math.floor(cost)}/${this.manager.maxAvailableCost}`;
  }

  /**
   * GameManagerDelegate 実装
   * 勝敗が決定したときのコールバック
   */
  public onGameOver(isPlayerWon: boolean): void {
    this.state = BattleState.FINISHED;

    const result = new BattleResult(isPlayerWon);
    result.onAnimationEnded = this.enableBackToTitle.bind(this);
    this.uiGraphContainer.addChild(result);

    this.registerUpdatingObject(result);
  }

  /**
   * GameManagerDelegate 実装
   * 渡されたユニット同士が接敵可能か返す
   */
  public shouldLockUnit(attacker: AttackableEntity, target: UnitEntity): boolean {
    return (attacker as Unit).isFoeContact((target as Unit).sprite);
  }

  public shouldLockBase(attacker: AttackableEntity, target: BaseEntity): boolean {
    return (attacker as Unit).isFoeContact((target as Base).sprite);
  }

  /**
   * GameManagerDelegate 実装
   * 渡されたユニット同士が攻撃可能か返す
   */
  public shouldDamage(attackerEntity: AttackableEntity, targetEntity: AttackableEntity): boolean {
    const attacker = attackerEntity as Unit;
    const target = targetEntity as Unit;

    if (!attacker.isHitFrame()) {
      return false;
    }

    return attacker.isFoeContact(target.sprite);
  }
  public shouldUnitWalk(entity: UnitEntity): boolean {
    const unit = entity as Unit;

    if (unit.getAnimationType() === ResourceMaster.Unit.AnimationTypes.WALK) {
      return true;
    }
    return unit.isAnimationLastFrameTime();
  }


  constructor() {
    super();

    this.transitionIn  = new FadeIn();
    this.transitionOut = new FadeOut();

    // BattleManager インスタンスの作成とコールバックの登録
    this.manager = new BattleManager();

    // Background インスタンスの作成
    this.field = new Field();
    // デフォルトのシーンステート
    this.state = BattleState.LOADING_RESOURCES;

    Debug: {
      this.maxUnitSlotCount = debugMaxUnitCount;
      this.fieldId   = debugField;
      this.stageId   = debugStage;
      this.unitIds   = debugUnits;
      this.baseIdMap = debugBaseIdMap;
      this.playerBaseParams = debugPlayerBaseParams;
      this.manager.costRecoveryPerFrame = debugCostRecoveryPerFrame;
      this.manager.maxAvailableCost     = debugMaxAvailableCost;
    }
  }

  /**
   * リソースリストの作成
   * ユーザが選択したユニットとフィールドのリソース情報も加える
   */
  protected createResourceList(): LoaderAddParam[] {
    const assets = super.createResourceList();

    for (let i = 0; i < this.unitIds.length; i++) {
      const unitId = this.unitIds[i];
      if (unitId >= 0) {
        const unitUrl      = ResourceMaster.Unit.Texture(unitId);
        const unitPanelUrl = ResourceMaster.Unit.PanelTexture(unitId);
        assets.push({ name: unitUrl,      url: unitUrl });
        assets.push({ name: unitPanelUrl, url: unitPanelUrl});
      }
    }

    const fieldMasterUrl = ResourceMaster.Field.Api(this.fieldId);
    assets.push({ name: ResourceMaster.Field.ApiEntryPoint(), url: fieldMasterUrl });

    const aiWaveMasterUrl = ResourceMaster.AiWave.Api(this.stageId);
    assets.push({ name: ResourceMaster.AiWave.ApiEntryPoint(), url: aiWaveMasterUrl });

    const unitMasterUrl = ResourceMaster.Unit.Api(this.unitIds);
    assets.push({ name: ResourceMaster.Unit.ApiEntryPoint(), url: unitMasterUrl });

    const baseMasterUrl = ResourceMaster.Base.Api(this.baseIdMap.player, this.baseIdMap.ai);
    assets.push({ name: ResourceMaster.Base.ApiEntryPoint(), url: baseMasterUrl });

    const playerBaseTextureUrl = ResourceMaster.Base.Texture(this.baseIdMap.player);
    assets.push({ name: playerBaseTextureUrl, url: playerBaseTextureUrl });
    if (this.baseIdMap.player !== this.baseIdMap.ai) {
      const aiBaseTextureUrl = ResourceMaster.Base.Texture(this.baseIdMap.ai);
      assets.push({ name: aiBaseTextureUrl, url: aiBaseTextureUrl });
    }

    if (this.unitIds.indexOf(-1) >= 0) {
      const emptyPanelUrl = ResourceMaster.Unit.PanelTexture(-1);
      assets.push({ name: emptyPanelUrl, url: emptyPanelUrl });
    }

    const fieldResources = Field.resourceList;
    for (let i = 0; i < fieldResources.length; i++) {
      const bgResourceUrl = fieldResources[i];
      assets.push({ name: bgResourceUrl, url: bgResourceUrl });
    }

    const deadResources = Dead.resourceList;
    for (let i = 0; i < deadResources.length; i++) {
      const deadResourceUrl = deadResources[i];
      assets.push({ name: deadResourceUrl, url: deadResourceUrl });
    }

    const collapseExplodeResources = CollapseExplodeEffect.resourceList
    for (let i = 0; i < collapseExplodeResources.length; i++) {
      const collapseExplodeResourceUrl = collapseExplodeResources[i];
      assets.push({ name: collapseExplodeResourceUrl, url: collapseExplodeResourceUrl });
    }

    const battleResultResources = BattleResult.resourceList;
    for (let i = 0; i < battleResultResources.length; i++) {
      const battleResultResourceUrl = battleResultResources[i];
      assets.push({ name: battleResultResourceUrl, url: battleResultResourceUrl });
    }

    assets.push({ name: ResourceMaster.Audio.BattleBgm, url: ResourceMaster.Audio.BattleBgm });

    return assets;
  }

  /**
   * リソースロード完了コールバック
   * BattleManager にユニットマスタ情報を私、フィールドやユニットボタンの初期化を行う
   */
  protected onResourceLoaded(): void {
    const resources = PIXI.loader.resources;

    const sceneUiGraphName = ResourceMaster.SceneUiGraph.Api(this);
    this.prepareUiGraphContainer(resources[sceneUiGraphName].data);

    const fieldMaster   = resources[ResourceMaster.Field.ApiEntryPoint()].data;
    const aiWaveMaster  = resources[ResourceMaster.AiWave.ApiEntryPoint()].data;
    const unitMasters   = resources[ResourceMaster.Unit.ApiEntryPoint()].data;
    const baseMasterMap = resources[ResourceMaster.Base.ApiEntryPoint()].data;

    this.field.init({ fieldLength: fieldMaster.length, zLines: 10 });

    for (let index = 0; index < this.maxUnitSlotCount; index++) {
      const unitButton = this.getUiGraphUnitButton(index);
      if (!unitButton) {
        continue;
      }

      unitButton.init(index, this.unitIds[index]);
    }

    baseMasterMap.player.maxHealth = this.playerBaseParams.maxHealth;

    this.manager.init({
      aiWaveMaster,
      fieldMaster,
      unitMasters,
      baseMasterMap,
      delegator: this
    });

    this.addChild(this.field);
    this.addChild(this.uiGraphContainer);

    const resource: any = PIXI.loader.resources[ResourceMaster.Audio.BattleBgm];
    const bgm = SoundManager.instance.createSound(BattleScene.battleBgmKey, resource.buffer);
    bgm.play(true);

    if (this.transitionIn.isFinished()) {
      this.state = BattleState.READY;
    } else {
      this.state = BattleState.RESOURCE_LOADED;
    }
  }

  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void {
    super.beginTransitionIn(() => {
      if (this.state === BattleState.RESOURCE_LOADED) {
        this.state = BattleState.READY;
        onTransitionFinished(this);
      }
    })
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
  public update(delta: number): void {
    switch (this.state) {
      case BattleState.LOADING_RESOURCES: break;
      case BattleState.READY: {
        this.state = BattleState.INGAME;
        break;
      }
      case BattleState.INGAME: {
        this.manager.update(delta);
        break;
      }
      case BattleState.FINISHED: {
        this.manager.update(delta);
        break;
      }
    }

    this.updateRegisteredObjects(delta);

    if (this.transitionIn.isActive()) {
      this.transitionIn.update(delta);
    } else if (this.transitionOut.isActive()) {
      this.transitionOut.update(delta);
    }

    for (let i = 0; i < this.destroyList.length; i++) {
      this.destroyList[i].destroy();
    }

    this.destroyList = [];
  }

  /**
   * UnitButton 用のコールバック
   * タップされたボタンに応じたユニットの生成を BattleManager にリクエストする
   */
  public onUnitButtonTapped(buttonIndex: number): void {
    if (this.state !== BattleState.INGAME) {
      return;
    }

    const unitButton = this.getUiGraphUnitButton(buttonIndex);
    if (unitButton) {
      this.manager.requestSpawnPlayer(unitButton.unitId);
    }
  }

  /**
   * ボタンインデックスから UnitButton インスタンスを返す
   */
  private getUiGraphUnitButton(index: number): UnitButton | undefined {
    const uiGraphUnitButtonName = `unit_button_${index+1}`;
    return this.uiGraph[uiGraphUnitButtonName] as UnitButton;
  }

  private enableBackToTitle(): void {
    this.interactive = true;
    this.on('pointerdown', (_e: PIXI.interaction.InteractionEvent) => this.returnToTitle());
  }

  private returnToTitle(): void {
    const soundManager = SoundManager.instance;
    const bgm = soundManager.getSound(BattleScene.battleBgmKey);
    if (bgm) {
      soundManager.unregisterSound(BattleScene.battleBgmKey);
      SoundManager.instance.fade(bgm, 0.01, 0.5, true);
    }
    GameManager.loadScene(new TitleScene());
  }
}

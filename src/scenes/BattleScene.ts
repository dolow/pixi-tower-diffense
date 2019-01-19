import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';

import UnitAnimationMaster from 'interfaces/master/UnitAnimationMaster';
import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import UpdateObject from 'interfaces/UpdateObject';
import BattleParameter from 'interfaces/BattleParameter';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';

import AttackableState from 'enum/AttackableState';
import BattleSceneState from 'enum/BattleSceneState';

import GameManager from 'managers/GameManager';
import SoundManager from 'managers/SoundManager';

import Scene from 'scenes/Scene';
import TitleScene from 'scenes/TitleScene';
import Fade from 'scenes/transition/Fade';

import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UnitButtonFactory from 'modules/UiNodeFactory/battle/UnitButtonFactory';
import BattleLogic from 'modules/BattleLogic';

import AttackableEntity from 'entity/AttackableEntity';
import BaseEntity from 'entity/BaseEntity';
import UnitEntity from 'entity/UnitEntity';

import Attackable from 'display/battle/Attackable';
import Unit from 'display/battle/Unit';
import Base from 'display/battle/Base';

import UnitButton from 'display/battle/UnitButton';
import Field from 'display/battle/Field';
import BattleResult from 'display/battle/BattleResult';
import AttackSmoke from 'display/battle/single_shot/AttackSmoke';
import Dead from 'display/battle/single_shot/Dead';
import CollapseExplodeEffect from 'display/battle/single_shot/CollapseExplodeEffect';

/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleLogic に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleLogicDelegate {

  /**
   * マスターデータを保存する PIXI.loaders.resource のキー
   */
  private static readonly MasterResourceKey = {
    FIELD: 'battle_scene_field_master',
    AI_WAVE: 'battle_scene_ai_wave_master',
    UNIT: 'battle_scene_unit_master',
    UNIT_ANIMATION: 'battle_scene_unit_animation_master',
    BASE: 'battle_scene_base_master'
  };

  /**
   * このシーンのステート
   */
  private state!: number;
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
   * ゲームロジックを処理する BattleLogic のインスタンス
   */
  private manager!: BattleLogic;
  /**
   * 背景の PIXI.Container
   */
  private field!: Field;

  /**
   * エンティティの ID で紐付けられた有効な Unit インスタンスのマップ
   */
  private attackables: Map<number, Attackable> = new Map();
  /**
   * エンティティの ID で紐付けられた有効な Base インスタンスのマップ
   */
  private bases: {
    player: Base | null;
    ai: Base | null;
  } = {
    player: null,
    ai: null
  }
  /**
   * ユニットアニメーションマスターのキャッシュ
   */
  private unitAnimationMasterCache: Map<number, UnitAnimationMaster> = new Map();
  /**
   * Field に最後にユニットを追加した Zline のインデックス
   * ユニットが重なって表示されるのを防ぐ
   */
  private fieldLastAddedZline: {
    player: number;
    ai: number;
  } = {
    player: -1,
    ai: -1
  };

  /**
   * コンストラクタ
   */
  constructor(params: BattleParameter) {
    super();

    this.transitionIn  = new Fade(1.0, 0.0, -0.02);
    this.transitionOut = new Fade(0.0, 1.0, 0.02);

    // デフォルトのシーンステート
    this.state = BattleSceneState.LOADING_RESOURCES;
    // BattleLogic インスタンスの作成
    this.manager = new BattleLogic();
    // Background インスタンスの作成
    this.field = new Field();

    // ユーザパラメータの設定
    this.maxUnitSlotCount = params.maxUnitSlotCount;
    this.fieldId   = params.fieldId;
    this.stageId   = params.stageId;
    this.unitIds   = params.unitIds;
    this.baseIdMap = params.baseIdMap;
    this.playerBaseParams = params.playerBaseParams;
    this.manager.costRecoveryPerFrame = params.cost.recoveryPerFrame;
    this.manager.maxAvailableCost     = params.cost.max;
  }

  /**
   * Scene クラスメソッドオーバーライド
   */

  /**
   * トランジション開始処理
   * トランジション終了で可能ならステートを変更する
   */
  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void {
    super.beginTransitionIn(() => {
      if (this.state === BattleSceneState.RESOURCE_LOADED) {
        this.state = BattleSceneState.READY;
        onTransitionFinished(this);
      }
    });
  }

  /**
   * 毎フレームの更新処理
   * シーンのステートに応じて処理する
   */
  public update(delta: number): void {
    switch (this.state) {
      case BattleSceneState.LOADING_RESOURCES: break;
      case BattleSceneState.READY: {
        this.state = BattleSceneState.INGAME;
        break;
      }
      case BattleSceneState.INGAME: {
        this.manager.update(delta);
        break;
      }
      case BattleSceneState.FINISHED: {
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
        const unitUrl      = ResourceMaster.Dynamic.Unit(unitId);
        const unitPanelUrl = ResourceMaster.Dynamic.UnitPanel(unitId);
        assets.push({ name: unitUrl,      url: unitUrl });
        assets.push({ name: unitPanelUrl, url: unitPanelUrl });
      }
    }

    const masterKeys = BattleScene.MasterResourceKey;

    const fieldMasterUrl = ResourceMaster.Api.Field(this.fieldId);
    const aiWaveMasterUrl = ResourceMaster.Api.AiWave(this.stageId);
    const unitMasterUrl = ResourceMaster.Api.Unit(this.unitIds);
    const unitAnimationMasterUrl = ResourceMaster.Api.UnitAnimation(this.unitIds);
    const baseMasterUrl = ResourceMaster.Api.Base(this.baseIdMap.player, this.baseIdMap.ai);

    assets.push({ name: masterKeys.FIELD, url: fieldMasterUrl });
    assets.push({ name: masterKeys.AI_WAVE, url: aiWaveMasterUrl });
    assets.push({ name: masterKeys.UNIT, url: unitMasterUrl });
    assets.push({ name: masterKeys.UNIT_ANIMATION, url: unitAnimationMasterUrl });
    assets.push({ name: masterKeys.BASE, url: baseMasterUrl });

    const playerBaseTextureUrl = ResourceMaster.Dynamic.Base(this.baseIdMap.player);
    assets.push({ name: playerBaseTextureUrl, url: playerBaseTextureUrl });
    if (this.baseIdMap.player !== this.baseIdMap.ai) {
      const aiBaseTextureUrl = ResourceMaster.Dynamic.Base(this.baseIdMap.ai);
      assets.push({ name: aiBaseTextureUrl, url: aiBaseTextureUrl });
    }

    if (this.unitIds.indexOf(-1) >= 0) {
      const emptyPanelUrl = ResourceMaster.Dynamic.UnitPanel();
      assets.push({ name: emptyPanelUrl, url: emptyPanelUrl });
    }

    const fieldResources = Field.resourceList;
    for (let i = 0; i < fieldResources.length; i++) {
      const bgResourceUrl = fieldResources[i];
      assets.push({ name: bgResourceUrl, url: bgResourceUrl });
    }

    const baseResources = Base.resourceList;
    for (let i = 0; i < baseResources.length; i++) {
      const baseResourceUrl = baseResources[i];
      assets.push({ name: baseResourceUrl, url: baseResourceUrl });
    }

    const attackSmokeResources = AttackSmoke.resourceList;
    for (let i = 0; i < attackSmokeResources.length; i++) {
      const attackSmokeResourcesUrl = attackSmokeResources[i];
      assets.push({ name: attackSmokeResourcesUrl, url: attackSmokeResourcesUrl });
    }

    const deadResources = Dead.resourceList;
    for (let i = 0; i < deadResources.length; i++) {
      const deadResourceUrl = deadResources[i];
      assets.push({ name: deadResourceUrl, url: deadResourceUrl });
    }

    const collapseExplodeResources = CollapseExplodeEffect.resourceList;
    for (let i = 0; i < collapseExplodeResources.length; i++) {
      const collapseExplodeResourceUrl = collapseExplodeResources[i];
      assets.push({ name: collapseExplodeResourceUrl, url: collapseExplodeResourceUrl });
    }

    const battleResultResources = BattleResult.resourceList;
    for (let i = 0; i < battleResultResources.length; i++) {
      const battleResultResourceUrl = battleResultResources[i];
      assets.push({ name: battleResultResourceUrl, url: battleResultResourceUrl });
    }

    assets.push({ name: ResourceMaster.Audio.Bgm.Battle, url: ResourceMaster.Audio.Bgm.Battle });
    assets.push({ name: ResourceMaster.Audio.Se.Attack1, url: ResourceMaster.Audio.Se.Attack1 });
    assets.push({ name: ResourceMaster.Audio.Se.Attack2, url: ResourceMaster.Audio.Se.Attack2 });
    assets.push({ name: ResourceMaster.Audio.Se.Win, url: ResourceMaster.Audio.Se.Win });
    assets.push({ name: ResourceMaster.Audio.Se.Lose, url: ResourceMaster.Audio.Se.Lose });

    return assets;
  }

  /**
   * リソースロード完了コールバック
   * BattleLogic にユニットマスタ情報を私、フィールドやユニットボタンの初期化を行う
   */
  protected onResourceLoaded(): void {
    const resources = PIXI.loader.resources as any;

    const sceneUiGraphName = ResourceMaster.Api.SceneUiGraph(this);
    this.prepareUiGraphContainer(resources[sceneUiGraphName].data);

    const masterKeys = BattleScene.MasterResourceKey;

    const fieldMaster = resources[masterKeys.FIELD].data;
    const aiWaveMaster = resources[masterKeys.AI_WAVE].data;
    const unitMasters = resources[masterKeys.UNIT].data;
    const unitAnimationMasters = resources[masterKeys.UNIT_ANIMATION].data;
    const baseMasterMap = resources[masterKeys.BASE].data;

    for (let i = 0; i < unitAnimationMasters.length; i++) {
      const master = unitAnimationMasters[i];
      this.unitAnimationMasterCache.set(master.unitId, master);
    }

    this.field.init({ fieldLength: fieldMaster.length, zLines: fieldMaster.zLines });

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

    const keys = Object.keys(resources);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = resources[key];
      if (item.buffer) {
        const audio = SoundManager.createSound(key, item.buffer);
        if (key === ResourceMaster.Audio.Bgm.Battle) {
          audio.play(true);
        }
      }
    }

    if (this.transitionIn.isFinished()) {
      this.state = BattleSceneState.READY;
    } else {
      this.state = BattleSceneState.RESOURCE_LOADED;
    }
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
   * BattleLogicDelegate 実装
   */

  /**
   * BaseEntity が生成されたときのコールバック
   * 表示物を生成する
   */
  public onBaseEntitySpawned(entity: BaseEntity, basePosition: number): void {
    const base = new Base(entity.baseId);
    base.sprite.position.x = basePosition;
    if (!entity.isPlayer) {
      base.sprite.scale.x = -1.0;
    }
    this.field.addChildAsForeBackgroundEffect(base.sprite);

    this.registerUpdatingObject(base);

    if (entity.isPlayer) {
      this.bases.player = base;
    } else {
      this.bases.ai = base;
    }

    this.attackables.set(entity.id, base);
  }

  /**
   * UnitEntity が生成されたときのコールバック
   * id に紐つけて表示物を生成する
   */
  public onUnitEntitySpawned(entity: UnitEntity, basePosition: number): void {
    const master = this.unitAnimationMasterCache.get(entity.unitId);
    if (!master) {
      return;
    }

    const base = (entity.isPlayer) ? this.bases.player : this.bases.ai;
    if (!base) {
      return;
    }

    base.spawn(entity.isPlayer);

    const unit = new Unit(entity.unitId, {
      hitFrame: master.hitFrame,
      animationMaxFrameIndexes: master.maxFrameIndexes,
      animationUpdateDurations: master.updateDurations
    });
    unit.sprite.scale.x = (entity.isPlayer) ? 1.0 : -1.0;
    unit.sprite.position.x = basePosition;
    unit.requestAnimation(ResourceMaster.AnimationTypes.Unit.WALK);

    this.attackables.set(entity.id, unit);

    const zLineCount = this.field.zLineCount;
    let index = Math.floor(Math.random() * this.field.zLineCount);

    let lastAddedZline;
    if (entity.isPlayer) {
      lastAddedZline = this.fieldLastAddedZline.player;
    } else {
      lastAddedZline = this.fieldLastAddedZline.ai;
    }

    if (index === lastAddedZline) {
      index++;
      if (index > (zLineCount - 1)) {
        index = 0;
      }
    }

    this.field.addChildToZLine(unit.sprite, index);

    // 重なって表示されないようにする
    if (entity.isPlayer) {
      this.fieldLastAddedZline.player = index;
    } else {
      this.fieldLastAddedZline.ai = index;
    }

    unit.saveSpawnedPosition();

    this.registerUpdatingObject(unit as UpdateObject);
  }

  /**
   * エンティティのステートが変更された際のコールバック
   */
  public onAttackableEntityStateChanged(entity: AttackableEntity, _oldState: number): void {
    const attackable = this.attackables.get(entity.id);
    if (!attackable) {
      return;
    }

    if ((entity as UnitEntity).unitId) {
      const unit = attackable as Unit;
      const animationTypes = ResourceMaster.AnimationTypes.Unit;
      switch (entity.state) {
        case AttackableState.IDLE: {
          unit.requestAnimation(animationTypes.WALK);
          break;
        }
        case AttackableState.LOCKED: {
          unit.requestAnimation(animationTypes.ATTACK);
          break;
        }
        case AttackableState.DEAD: {
          const effect = new Dead(!entity.isPlayer);
          const yAdjust = attackable.sprite.height * (1.0 - attackable.sprite.anchor.y) - effect.height;
          effect.position.set(attackable.sprite.position.x, attackable.sprite.position.y + yAdjust);
          attackable.sprite.parent.addChild(effect);
          this.registerUpdatingObject(effect);

          attackable.destroy();
          break;
        }
        default: break;
      }
    } else {
      if (entity.state === AttackableState.DEAD) {
        const base = attackable as Base;
        base.collapse();
        this.field.addChildAsForeForegroundEffect(base.explodeContainer);
      }
    }
  }

  /**
   * 利用可能なコストの値が変動したときのコールバック
   */
  public onAvailableCostUpdated(cost: number): void {
    const text = `${Math.floor(cost)}/${this.manager.maxAvailableCost}`;
    (this.uiGraph.cost_text as PIXI.Text).text = text;
  }

  /**
   * 勝敗が決定したときのコールバック
   */
  public onGameOver(isPlayerWon: boolean): void {
    this.state = BattleSceneState.FINISHED;

    const result = new BattleResult(isPlayerWon);
    result.onAnimationEnded = this.enableBackToTitle.bind(this);
    this.uiGraphContainer.addChild(result);

    const bgm = SoundManager.getSound(ResourceMaster.Audio.Bgm.Battle);
    if (bgm) {
      bgm.stop();
    }

    const soundName = isPlayerWon ? ResourceMaster.Audio.Se.Win : ResourceMaster.Audio.Se.Lose;
    const sound = SoundManager.getSound(soundName);
    if (sound) {
      sound.play();
    }

    // 攻撃をやめる
    this.attackables.forEach((attackable) => {
      const unit = attackable as Unit;
      if (!unit.requestAnimation) {
        return;
      }
      unit.requestAnimation(ResourceMaster.AnimationTypes.Unit.WAIT);
    });

    this.registerUpdatingObject(result);
  }

  /**
   * 渡されたエンティティ同士が接敵可能か返す
   */
  public shouldLockAttackableEntity(attacker: AttackableEntity, target: AttackableEntity): boolean {
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
   * 渡されたエンティティ同士が攻撃可能か返す
   */
  public shouldDamage(attackerEntity: AttackableEntity, targetEntity: AttackableEntity): boolean {
    const attackerAttackable = this.attackables.get(attackerEntity.id);
    if (!attackerAttackable) {
      return false;
    }
    let targetAttackable = this.attackables.get(targetEntity.id);
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
   * 渡された UnitEntity の distance が変化した時に呼ばれる
   */
  public onUnitEntityWalked(entity: UnitEntity): void {
    const attackable = this.attackables.get(entity.id);
    if (!attackable) {
      return;
    }
    const unit = attackable as Unit;
    const direction = entity.isPlayer ? 1 : -1;

    unit.sprite.position.x = unit.getSpawnedPosition().x + entity.distance * direction;
  }

  /**
   * 渡されたエンティティの health が増減した場合に呼ばれる
   */
  public onAttackableEntityHealthUpdated(
    _attacker: AttackableEntity,
    target: AttackableEntity,
    fromHealth: number,
    toHealth: number,
    maxHealth: number
  ): void {
    const sound = SoundManager.getSound((Math.random() >= 0.5)
      ? ResourceMaster.Audio.Se.Attack1
      : ResourceMaster.Audio.Se.Attack2
    );
    if (sound) {
      sound.play();
    }

    const targetAttackable = this.attackables.get(target.id);
    if (!targetAttackable) {
      return;
    }

    const targetSprite = targetAttackable.sprite;

    // smoke effect
    const smoke = new AttackSmoke();
    const xRand = Math.random() * targetSprite.width;
    const yRand = Math.random() * targetSprite.height;
    const xAdjust = targetSprite.width * (0.5 + targetSprite.anchor.x);
    const yAdjust = targetSprite.height * (0.5 + targetSprite.anchor.y);
    const targetCenterX = targetSprite.position.x + xRand - xAdjust;
    const targetCenterY = targetSprite.position.y + yRand - yAdjust;
    const scale = 0.5 + Math.random() * 0.5;

    smoke.position.set(targetCenterX, targetCenterY);
    smoke.scale.set(scale, scale);

    targetSprite.parent.addChild(smoke);

    // HealthGauge を表示させる
    if ((target as UnitEntity).unitId) {
      const attackable = this.attackables.get(target.id);
      if (!attackable) {
        return;
      }
      const gauge = (attackable as Unit).spawnHealthGauge(fromHealth / maxHealth, toHealth / maxHealth);
      targetSprite.parent.addChild(gauge);
      this.registerUpdatingObject(gauge);
    }

    this.registerUpdatingObject(smoke);
  }
  /**
  * 渡されたユニットが移動すべきかどうかを返す
   */
  public shouldUnitWalk(entity: UnitEntity): boolean {
    const attackable = this.attackables.get(entity.id);
    if (!attackable) {
      return false;
    }
    if (!(entity as UnitEntity).unitId) {
      return false;
    }

    if (attackable.getAnimationType() === ResourceMaster.AnimationTypes.Unit.WALK) {
      return true;
    }
    return (attackable as Unit).isAnimationLastFrameTime();
  }

  /**
   * 特異メソッド
   */

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
      this.manager.requestSpawnPlayer(unitButton.unitId);
    }
  }

  /**
   * ボタンインデックスから UnitButton インスタンスを返す
   */
  private getUiGraphUnitButton(index: number): UnitButton | undefined {
    const uiGraphUnitButtonName = `unit_button_${index + 1}`;
    return this.uiGraph[uiGraphUnitButtonName] as UnitButton;
  }

  private enableBackToTitle(): void {
    this.interactive = true;
    this.on('pointerdown', (_e: PIXI.interaction.InteractionEvent) => this.backToTitle());
  }

  private backToTitle(): void {
    const resources = PIXI.loader.resources as any;

    const keys = Object.keys(resources);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = resources[key];
      if (item.buffer) {
        SoundManager.destroySound(key);
      }
    }

    GameManager.loadScene(new TitleScene());
  }
}

import * as PIXI from 'pixi.js';
import Resource from 'Resource';

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
import OrderScene from 'scenes/OrderScene';
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
   * このシーンのステート
   */
  private state!: number;
  /**
   * ユニット編成数
   */
  private unitSlotCount!: number;
  /**
   * 挑戦するステージID
   */
  private stageId!: number;
  /**
   * 編成した拠点パラメータ
   */
  private playerBase!: {
    baseId: number;
    maxHealth: number;
  };
  /**
   * 編成したユニットID配列
   */
  private unitIds!: number[];
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
  };
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
    this.unitSlotCount = params.unitSlotCount;
    this.stageId   = params.stageId;
    this.unitIds   = params.unitIds;
    this.playerBase = params.playerBase;
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
      // リソースもロードされていれば READY ステートに変更する
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
   */
  protected createInitialResourceList(): (LoaderAddParam | string)[] {
    let assets = super.createInitialResourceList();
    assets = assets.concat(
      Field.resourceList,
      Base.resourceList,
      AttackSmoke.resourceList,
      Dead.resourceList,
      CollapseExplodeEffect.resourceList,
      BattleResult.resourceList,
      [
        Resource.Api.Stage(this.stageId),
        Resource.Dynamic.Base(this.playerBase.baseId),
        Resource.Audio.Bgm.Battle,
        Resource.Audio.Se.Attack1,
        Resource.Audio.Se.Attack2,
        Resource.Audio.Se.Bomb,
        Resource.Audio.Se.UnitSpawn,
        Resource.Audio.Se.Win,
        Resource.Audio.Se.Lose
      ]
    );

    return assets;
  }

  /**
   * リソースロード完了コールバック
   * BattleLogic にユニットマスタ情報を渡し、フィールドやユニットボタンの初期化を行う
   */
  protected onInitialResourceLoaded(): (LoaderAddParam | string)[] {
    const additionalAssets = super.onInitialResourceLoaded();

    const resources = PIXI.loader.resources as any;

    const stageMaster = resources[Resource.Api.Stage(this.stageId)].data;
    // ステージ情報を取得するまでは AI 拠点テクスチャは分からないのでここでロードする
    additionalAssets.push(Resource.Dynamic.Base(stageMaster.aiBase.baseId));

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

    // ステージ情報を取得するまでは AI ユニット情報が分からないのでここでロードする
    additionalAssets.push(Resource.Api.Unit(this.unitIds));
    additionalAssets.push(Resource.Api.UnitAnimation(this.unitIds));

    for (let i = 0; i < this.unitIds.length; i++) {
      const unitId = this.unitIds[i];
      // 無効なユニット ID を渡した場合に空のユニットボタン扱いになる
      additionalAssets.push(Resource.Dynamic.UnitPanel(unitId));

      // 無効なユニット ID ではリソースは取得できない
      if (unitId > 0) {
        additionalAssets.push(Resource.Dynamic.Unit(unitId));
      }
    }

    return additionalAssets;
  }

  /**
   * リソースロード完了時のコールバック
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const resources = PIXI.loader.resources;

    const stageMaster = resources[Resource.Api.Stage(this.stageId)].data;
    const unitMasters = resources[Resource.Api.Unit(this.unitIds)].data;

    const unitAnimationMasters = resources[Resource.Api.UnitAnimation(this.unitIds)].data;
    for (let i = 0; i < unitAnimationMasters.length; i++) {
      const master = unitAnimationMasters[i];
      this.unitAnimationMasterCache.set(master.unitId, master);
    }

    this.field.init({ fieldLength: stageMaster.length, zLines: stageMaster.zLines });

    this.initSound();
    this.initUnitButtons();
    this.addChild(this.field);
    this.addChild(this.uiGraphContainer);

    this.manager.init({
      stageMaster,
      unitMasters,
      delegator: this,
      playerBase: {
        baseId: this.playerBase.baseId,
        health: this.playerBase.maxHealth
      }
    });

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
   */
  public onBaseEntitySpawned(entity: BaseEntity, basePosition: number): void {
    // 拠点の描画物を生成する
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
      spawnPosition: { x: basePosition, y: 0 },
      animationMaxFrameIndexes: master.maxFrameIndexes,
      animationUpdateDurations: master.updateDurations
    });

    unit.sprite.scale.x = (entity.isPlayer) ? 1.0 : -1.0;
    unit.requestAnimation(Resource.AnimationTypes.Unit.WALK);

    this.attackables.set(entity.id, unit);

    // Field に追加する重なり順を決定する
    const zLineCount = this.field.zLineCount;
    let index = Math.floor(Math.random() * this.field.zLineCount);

    // 最後に追加された Zline と同じ場合は表示が重なって見えてしまうので避ける
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
        case AttackableState.DEAD: {
          // 死亡時は死亡エフェクトを表示してもともとのユニット描画物は破棄する
          const effect = new Dead(!entity.isPlayer);
          const sprite = attackable.sprite;
          const yAdjust = sprite.height * (1.0 - sprite.anchor.y) - effect.height;
          effect.position.set(sprite.position.x, sprite.position.y + yAdjust);
          sprite.parent.addChild(effect);
          this.registerUpdatingObject(effect);

          attackable.destroy();
          break;
        }
        default: break;
      }
    } else {
      if (entity.state === AttackableState.DEAD) {
        // 拠点が破壊されたときは破壊エフェクトを開始させる
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

    // 攻撃をやめる
    this.attackables.forEach((attackable) => {
      const unit = attackable as Unit;
      if (!unit.requestAnimation) {
        return;
      }
      unit.requestAnimation(Resource.AnimationTypes.Unit.WAIT);
    });

    // ゲームオーバー表示をする
    const result = new BattleResult(isPlayerWon);
    result.onAnimationEnded = this.enableBackToOrderScene.bind(this);
    this.uiGraphContainer.addChild(result);

    this.registerUpdatingObject(result);

    // BGM を止める
    this.stopBgm(Resource.Audio.Bgm.Battle);
    // ゲームオーバーサウンドを再生
    this.playSe(isPlayerWon ? Resource.Audio.Se.Win : Resource.Audio.Se.Lose);
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
   * 渡されたエンティティ同士が攻撃可能か返す
   */
  public shouldDamage(attackerEntity: AttackableEntity, targetEntity: AttackableEntity): boolean {
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
    const targetAttackable = this.attackables.get(target.id);
    if (!targetAttackable) {
      return;
    }

    const targetSprite = targetAttackable.sprite;

    // 攻撃時砂煙演出の表示
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
    this.registerUpdatingObject(smoke);

    // 体力ゲージの表示
    if ((target as UnitEntity).unitId) {
      const attackable = this.attackables.get(target.id);
      if (!attackable) {
        return;
      }
      const fromPercent = fromHealth / maxHealth;
      const toPercent = toHealth / maxHealth;
      const gauge = (attackable as Unit).spawnHealthGauge(fromPercent, toPercent);
      targetSprite.parent.addChild(gauge);
      this.registerUpdatingObject(gauge);
    }

    // ランダムに攻撃効果音を再生する
    this.playSe((Math.random() >= 0.5)
      ? Resource.Audio.Se.Attack1
      : Resource.Audio.Se.Attack2
    );
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

    if (attackable.getAnimationType() === Resource.AnimationTypes.Unit.WALK) {
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
   * サウンドの初期化
   */
  private initSound(): void {
    const resources = PIXI.loader.resources as any;

    const audioMaster = Resource.Audio;
    SoundManager.createSound(audioMaster.Bgm.Battle, resources[audioMaster.Bgm.Battle].buffer);
    SoundManager.createSound(audioMaster.Se.Attack1, resources[audioMaster.Se.Attack1].buffer);
    SoundManager.createSound(audioMaster.Se.Attack2, resources[audioMaster.Se.Attack2].buffer);
    SoundManager.createSound(audioMaster.Se.Bomb, resources[audioMaster.Se.Bomb].buffer);
    SoundManager.createSound(audioMaster.Se.UnitSpawn, resources[audioMaster.Se.UnitSpawn].buffer);
    SoundManager.createSound(audioMaster.Se.Win, resources[audioMaster.Se.Win].buffer);
    SoundManager.createSound(audioMaster.Se.Lose, resources[audioMaster.Se.Lose].buffer);

    this.playBgm(Resource.Audio.Bgm.Battle);
  }

  /**
   * ユニットボタンの初期化
   */
  private initUnitButtons(): void {
    const unitMasters = PIXI.loader.resources[Resource.Api.Unit(this.unitIds)].data;
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
    }
  }

  /**
   * ボタンインデックスから UnitButton インスタンスを返す
   */
  private getUiGraphUnitButton(index: number): UnitButton | undefined {
    const uiGraphUnitButtonName = `unit_button_${index + 1}`;
    return this.uiGraph[uiGraphUnitButtonName] as UnitButton;
  }

  /**
   * 編成画面へ戻る操作を有効にする
   */
  private enableBackToOrderScene(): void {
    this.interactive = true;
    this.on('pointerdown', (_e: PIXI.interaction.InteractionEvent) => this.backToOrderScene());
  }

  /**
   * 編成画面へ戻る
   */
  private backToOrderScene(): void {
    const resources = PIXI.loader.resources as any;

    const keys = Object.keys(resources);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = resources[key];
      if (item.buffer) {
        SoundManager.destroySound(key);
      }
    }

    GameManager.loadScene(new OrderScene());
  }
}

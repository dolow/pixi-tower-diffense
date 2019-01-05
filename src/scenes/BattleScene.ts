import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import UnitState from 'enum/UnitState';
import BattleManager from 'managers/BattleManager';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UnitButtonFactory from 'modules/UiNodeFactory/battle/UnitButtonFactory';
import UnitButton from 'display/battle/UnitButton';
import Unit from 'display/battle/Unit';
import Field from 'display/battle/Field';
import Dead from 'display/battle/effect/Dead';

const debugMaxUnitCount = 5;
const debugField: number = 1;
const debugStage: number = 1;
const debugUnits: number[] = [1, -1, 3, -1, 5];
const debugCostRecoveryPerFrame = 0.05;
const debugMaxAvailableCost     = 100;

/**
 * BattleScene のステートのリスト
 */
const BattleState = Object.freeze({
  LOADING_RESOURCES: 1,
  READY: 2,
  INGAME: 3,
  FINISHED: 4
});

/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleManager に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleManagerDelegate {
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
   * 編成したユニットID配列
   */
  private unitIds!: number[];
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

  private destroyList: PIXI.Container[] = [];

  /**
   * 拠点の座標
   */
  private basePos = {
    player: 0,
    ai: 0
  };

  /**
   * GameMasterDelegate 実装
   * Unit が発生したときのコールバック
   * Field に Unit のスプライトを追加する
   */
  public onUnitsSpawned(units: Unit[]): void {
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      if (unit.isPlayer) {
        unit.sprite.position.x = this.basePos.player;
      } else {
        unit.sprite.position.x = this.basePos.ai;
      }
      this.field.addChildToRandomZLine(unit.sprite);
    }
  }

  /**
   * ユニットのステートが変更した際のコールバック
   */
  public onUnitStateChanged(unit: Unit, _oldState: number): void {
    unit.resetAnimation();
  }

  /**
   * GameMasterDelegate 実装
   * Unit が更新されたときのコールバック
   * Unit のアニメーションと PIXI による描画を更新する
   */
  public onUnitUpdated(unit: Unit): void {
    const animationTypes = ResourceMaster.UnitAnimationTypes;
    let animationType = unit.getAnimationType();

    switch (unit.state) {
      case UnitState.IDLE: {
        if (animationType !== animationTypes.WALK) {
          if (unit.isAnimationLastFrameTime()) {
            animationType = animationTypes.WALK;
            unit.resetAnimation();
          }
        } else {
          if (unit.isPlayer) {
            unit.sprite.position.x = this.basePos.player + unit.distance;
          } else {
            unit.sprite.position.x = this.basePos.ai - unit.distance;
          }
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
        this.field.addChild(effect);
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
   * GameMasterDelegate 実装
   * 利用可能なコストの値が変動したときのコールバック
   */
  public onAvailableCostUpdated(cost: number): void {
    (this.uiGraph.cost_text as PIXI.Text).text = `${Math.floor(cost)}`;
  }

  /**
   * GameMasterDelegate 実装
   * 渡されたユニット同士が接敵可能か返す
   */
  public shouldLock(attacker: Unit, target: Unit): boolean {
    return attacker.isFoeContact(target);
  }

  /**
   * GameMasterDelegate 実装
   * 渡されたユニット同士が攻撃可能か返す
   */
  public shouldDamage(attacker: Unit, target: Unit): boolean {
    if (!attacker.isHitFrame()) {
      return false;
    }

    return attacker.isFoeContact(target);
  }
  public shouldWalk(unit: Unit): boolean {
    if (unit.getAnimationType() === ResourceMaster.UnitAnimationTypes.WALK) {
      return true;
    }
    return unit.isAnimationLastFrameTime();
  }


  constructor() {
    super();

    // BattleManager インスタンスの作成とコールバックの登録
    this.manager = new BattleManager();
    this.manager.setDelegator(this);

    // Background インスタンスの作成
    this.field = new Field();
    // デフォルトのシーンステート
    this.state = BattleState.LOADING_RESOURCES;

    Debug: {
      this.maxUnitSlotCount = debugMaxUnitCount;
      this.fieldId = debugField;
      this.stageId = debugStage;
      this.unitIds = debugUnits;
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
        const unitUrl      = ResourceMaster.UnitTexture(unitId);
        const unitPanelUrl = ResourceMaster.UnitPanelTexture(unitId);
        assets.push({ name: unitUrl,      url: unitUrl });
        assets.push({ name: unitPanelUrl, url: unitPanelUrl});
      }
    }

    const fieldMasterUrl = ResourceMaster.Field(this.fieldId);
    assets.push({ name: ResourceMaster.FieldEntryPoint(), url: fieldMasterUrl });

    const aiWaveMasterUrl = ResourceMaster.AIWave(this.stageId);
    assets.push({ name: ResourceMaster.AIWaveEntryPoint(), url: aiWaveMasterUrl });

    const unitMasterUrl = ResourceMaster.Unit(this.unitIds);
    assets.push({ name: ResourceMaster.UnitEntryPoint(), url: unitMasterUrl });

    if (this.unitIds.indexOf(-1) >= 0) {
      const emptyPanelUrl = ResourceMaster.UnitPanelTexture(-1);
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

    return assets;
  }

  /**
   * リソースロード完了コールバック
   * BattleManager にユニットマスタ情報を私、フィールドやユニットボタンの初期化を行う
   */
  protected onResourceLoaded(): void {
    const resources = PIXI.loader.resources;

    const sceneUiGraphName = ResourceMaster.SceneUiGraph(this);
    this.prepareUiGraphContainer(resources[sceneUiGraphName].data);

    const fieldMaster = resources[ResourceMaster.FieldEntryPoint()];
    this.basePos.player = fieldMaster.data.playerBasePosition;
    this.basePos.ai     = fieldMaster.data.aiBasePosition;

    const aiWaveMaster = resources[ResourceMaster.AIWaveEntryPoint()];
    const unitMaster = resources[ResourceMaster.UnitEntryPoint()];

    this.manager.init(aiWaveMaster.data, unitMaster.data);
    this.field.init();

    for (let index = 0; index < this.maxUnitSlotCount; index++) {
      const unitButton = this.getUiGraphUnitButton(index);
      if (!unitButton) {
        continue;
      }

      unitButton.init(index, this.unitIds[index]);
    }

    this.addChild(this.field);
    this.addChild(this.uiGraphContainer);

    this.state = BattleState.READY;
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
    }

    this.updateRegisteredObjects(delta);

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
}

import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';
import UpdateObject from 'interfaces/UpdateObject';
import BattleLogicDelegate from 'example/BattleLogicDelegate';
import UnitAnimationMaster from 'interfaces/master/UnitAnimationMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import UnitButton from 'example/UnitButton';
import UnitEntity from 'example/UnitEntity';
import Attackable from 'example/Attackable';
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

    this.unitIds = [1,2,3,4,5];
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
    return super.createInitialResourceList().concat(Field.resourceList);
  }

  /**
   * リソースロード完了コールバック
   * BattleLogic にユニットマスタ情報を渡し、フィールドやユニットボタンの初期化を行う
   */
  protected onInitialResourceLoaded(): (LoaderAddParam | string)[] {
    const additionalAssets = super.onInitialResourceLoaded();
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

    const unitMasters = resources[Resource.Api.Unit(this.unitIds)].data;

    const animationKey = Resource.Api.UnitAnimation(this.unitIds);
    const unitAnimationMasters = resources[animationKey].data;
    for (let i = 0; i < unitAnimationMasters.length; i++) {
      const master = unitAnimationMasters[i];
      this.unitAnimationMasterCache.set(master.unitId, master);
    }

    this.field.init({ fieldLength: 2000, zLines: 8 });
    this.addChild(this.field);
    this.addChild(this.uiGraphContainer);

    this.initUnitButtons();

    this.battleLogic.init({
      delegator: this,
      player: {
        unitIds: this.unitIds
      },
      unitMasters,
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
   * UnitEntity が生成されたときのコールバック
   * id に紐つけて表示物を生成する
   */
  public onUnitEntitySpawned(entity: UnitEntity, _basePosition: number): void {
    const master = this.unitAnimationMasterCache.get(entity.unitId);
    if (!master) {
      return;
    }

    //const zLineIndex = this.field.getDifferentZlineIndex();
    const zLineIndex = Math.floor(Math.random() * this.field.zLineCount);

    const unit = new Unit(master);

    unit.sprite.scale.x = (entity.isPlayer) ? 1.0 : -1.0;
    unit.sprite.position.set(100, 300);
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

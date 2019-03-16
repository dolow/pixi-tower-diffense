import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';
import BattleLogicDelegate from 'example/BattleLogicDelegate';
import UnitAnimationMaster from 'interfaces/master/UnitAnimationMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import BattleLogic from 'example/BattleLogic';
import BattleLogicConfig from 'example/BattleLogicConfig';
import Field from 'example/Field';

/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleLogic に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleLogicDelegate {

  /**
   * 編成したユニットID配列
   */
  private unitIds!: number[];
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
   * コンストラクタ
   */
  constructor() {
    super();

    this.unitIds = [1,2,3,4,5];
    this.interactive = true;

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
      additionalAssets.push(Resource.Dynamic.Unit(unitId));
    }

    return additionalAssets;
  }

  /**
   * リソースロード完了時のコールバック
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const resources = PIXI.loader.resources as any;

    const animationKey = Resource.Api.UnitAnimation(this.unitIds);
    const unitAnimationMasters = resources[animationKey].data;
    for (let i = 0; i < unitAnimationMasters.length; i++) {
      const master = unitAnimationMasters[i];
      this.unitAnimationMasterCache.set(master.unitId, master);
    }

    this.field.init({ fieldLength: 2000, zLines: 8 });
    this.addChild(this.field);
    this.addChild(this.uiGraphContainer);

    this.battleLogic.init({
      delegator: this,
      config: this.battleLogicConfig
    });
  }

  /**
   * 毎フレームの更新処理
   * シーンのステートに応じて処理する
   */
  public update(delta: number) {
    this.battleLogic.update(delta);
  }

  /**
   * 利用可能なコストの値が変動したときのコールバック
   */
  public onAvailableCostUpdated(cost: number, maxCost: number): void {
    const text = `${Math.floor(cost)}/${maxCost}`;
    (this.uiGraph.cost_text as PIXI.Text).text = text;
  }
}

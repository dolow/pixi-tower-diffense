import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';
import UnitAnimationMaster from 'interfaces/master/UnitAnimationMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import Unit from 'example/Unit';
import Field from 'example/Field';

/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleLogic に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene {

  /**
   * 編成したユニットID配列
   */
  private unitIds!: number[];

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

    this.field.init();
    this.addChild(this.field);

    const resources = PIXI.loader.resources as any;

    const animationKey = Resource.Api.UnitAnimation(this.unitIds);
    const unitAnimationMasters = resources[animationKey].data;
    for (let i = 0; i < unitAnimationMasters.length; i++) {
      const master = unitAnimationMasters[i];
      this.unitAnimationMasterCache.set(master.unitId, master);

      const unit = new Unit(master);
      unit.sprite.position.set(100 + i * 120, 200 + i * 60);
      unit.animationType = 'walk';
      this.addChild(unit.sprite);
      this.registerUpdatingObject(unit);
    }
  }
}

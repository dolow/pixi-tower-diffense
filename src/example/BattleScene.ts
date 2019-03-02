import * as PIXI from 'pixi.js';
import Resource from 'Resource';
import UnitAnimationMaster, { UnitAnimationTypeIndex } from 'interfaces/master/UnitAnimationMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import Unit from 'example/Unit';
import GameManager from 'example/GameManager';

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
   * Unit インスタンス配列
   */
  private units: Unit[] = [];

  /**
   * コンストラクタ
   */
  constructor() {
    super();

    this.unitIds = [1,2,3,4,5];
    this.interactive = true;

    // タップを反応させるための描画
    const renderer = GameManager.instance.game.renderer;
    const graphic = new PIXI.Graphics();
    graphic.beginFill(0x000000);
    graphic.moveTo(0, 0);
    graphic.lineTo(renderer.width, 0);
    graphic.lineTo(renderer.width, renderer.height);
    graphic.lineTo(0, renderer.height);
    graphic.endFill();
    this.addChild(graphic);

    // タップ毎にアニメーションを変える
    let currentType: UnitAnimationTypeIndex = 'wait';
    this.on('pointerup', () => {
      switch (currentType) {
        case 'wait':   currentType = 'damage'; break;
        case 'damage': currentType = 'attack'; break;
        case 'attack': currentType = 'walk';   break;
        case 'walk':   currentType = 'wait';   break;
      }

      for (let i = 0; i < this.units.length; i++) {
        this.units[i].requestAnimation(currentType);
      }
    });
  }

  /**
   * Scene クラスメソッドオーバーライド
   */

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

      const unit = new Unit(master);
      unit.sprite.position.set(100 + i * 120, 200 + i * 60);
      unit.animationType = 'walk';
      this.addChild(unit.sprite);
      this.registerUpdatingObject(unit);
      this.units.push(unit);
    }
  }
}

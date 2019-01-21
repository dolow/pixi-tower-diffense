import Config from  'Config';
import ResourceMaster from 'ResourceMaster';
import GameManager from 'managers/GameManager';
import IndexedDBManager from 'managers/IndexedDBManager';
import SoundManager from 'managers/SoundManager';
import UserBattle from 'interfaces/api/UserBattle';
import UnitMaster from 'interfaces/master/UnitMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import BattleParameter from 'interfaces/BattleParameter';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UnitButtonFactory from 'modules/UiNodeFactory/battle/UnitButtonFactory';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';
import Fade from 'scenes/transition/Fade';
import UnitButton from 'display/battle/UnitButton';

// デブッグ用ユーザID
const DUMMY_USER_ID = 1;

/**
 * 編成シーン
 */
export default class OrderScene extends Scene  {
  /**
   * ユーザのバトル情報
   */
  private userBattle: UserBattle | null = null;
  /**
   * ユニットマスターのキャッシュ
   */
  private unitMasterCache: Map<number, UnitMaster> = new Map();
  /**
   * ユニットIDと紐つけたユニットパネル用のテクスチャマップ
   */
  private unitButtonTexturesCache: Map<number, PIXI.Texture> = new Map();
  /**
   * ユニット枠IDと紐つけたユニットパネル用のマップ
   */
  private unitButtons: Map<number, UnitButton> = new Map();
  /**
   * 選択中のステージID
   */
  private currentStageId: number = 1;
  /**
   * 前回編成したユニットID配列
   */
  private lastUnitIds: number[] = [];

  /**
   * コンストラクタ
   */
  constructor() {
    super();

    this.transitionIn  = new Fade(1.0, 0.0, -0.02);
    this.transitionOut = new Fade(0.0, 1.0, 0.02);
  }

  /**
   * リソースをロードする
   * 基本実装をオーバーライドし、 indexed db のレコードを取得する
   */
  public loadResource(onResourceLoaded: () => void): void {
    new Promise((resolve) => {
      IndexedDBManager.get('lastStageId', (value) => {
        if (value) {
          this.currentStageId = value;
        }
        resolve();
      });
    }).then(() => {
      return new Promise((resolve) => {
        IndexedDBManager.get('lastUnitOrder', (value) => {
          if (value) {
            this.lastUnitIds = value;
          }
          resolve();
        });
      });
    }).then(() => {
      return new Promise((resolve) => {
        this.loadUiGraph(() => resolve());
      });
    }).then(() => {
      return new Promise((resolve) => {
        this.onUiGraphLoaded(() => resolve());
      });
    }).then(() => {
      onResourceLoaded();
    }).then(() => {
      this.onResourceLoaded();
    });
  }

  /**
   * 独自 UiGraph 要素のファクトリを返す
   * OrderScene は BattleScene と UnitButton を共用している
   */
  protected getCustomUiGraphFactory(type: string): UiNodeFactory | null {
    if (type === 'unit_button') {
      return new UnitButtonFactory();
    }
    return null;
  }

  /**
   * リソースリストを作成し返却する
   */
  protected createResourceList(): LoaderAddParam[] {
    const assets = super.createResourceList();

    const userBattleUrl = ResourceMaster.Api.UserBattle(DUMMY_USER_ID);
    assets.push({ name: userBattleUrl, url: userBattleUrl });

    const allUnitMasterUrl = ResourceMaster.Api.AllUnit();
    assets.push({ name: allUnitMasterUrl, url: allUnitMasterUrl });

    const bgmTitleName = ResourceMaster.Audio.Bgm.Title;
    if (!SoundManager.hasSound(bgmTitleName)) {
      assets.push({ name: bgmTitleName, url: bgmTitleName });
    }

    return assets;
  }

  /**
   * リソースがロードされた時のコールバック
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const resources = PIXI.loader.resources;

    this.unitButtonTexturesCache.clear();
    this.unitMasterCache.clear();

    const userBattleUrl = ResourceMaster.Api.UserBattle(DUMMY_USER_ID);
    this.userBattle = resources[userBattleUrl].data;

    if (!this.userBattle) {
      throw new Error('user_battle record could not be retrieved');
    }

    const allUnitMaster = resources[ResourceMaster.Api.AllUnit()].data;
    for (let i = 0; i < allUnitMaster.length; i++) {
      const unitMaster = allUnitMaster[i];
      this.unitMasterCache.set(unitMaster.unitId, unitMaster);
    }

    const dependencyAssets = [];

    for (let i = 0; i < this.userBattle.unlockedUnitIds.length; i++) {
      const unitId = this.userBattle.unlockedUnitIds[i];
      const url = ResourceMaster.Dynamic.UnitPanel(unitId);
      if (!resources[url]) {
        dependencyAssets.push({ url, name: url });
      }
    }

    if (dependencyAssets.length > 0) {
      PIXI.loader.add(dependencyAssets).load(() => {
        this.onDependencyResourceLoaded();
      });
    } else {
      this.onDependencyResourceLoaded();
    }
  }

  /**
   * 追加リソースダウンロード完了時コールバック
   */
  private onDependencyResourceLoaded(): void {
    if (!this.userBattle) {
      throw new Error('user_battle record missing');
    }
    for (let i = 0; i < this.userBattle.unlockedUnitIds.length; i++) {
      const unitId = this.userBattle.unlockedUnitIds[i];
      const url = ResourceMaster.Dynamic.UnitPanel(unitId);
      this.unitButtonTexturesCache.set(unitId, PIXI.loader.resources[url].texture);
    }

    this.initUnitButtons();

    this.playBgmIfNeeded();
  }

  /**
   * ユニットの切り替えボタンが押下された時のコールバック
   */
  public onUnitArrowTapped(slotIndex: number, addValue: number): void {
    if (!this.userBattle) {
      return;
    }
    if (addValue === 0) {
      return;
    }
    const unitButton = this.unitButtons.get(slotIndex);
    if (!unitButton) {
      return;
    }

    const availableUnitIds = this.userBattle.unlockedUnitIds;

    let nextIndex = availableUnitIds.indexOf(unitButton.unitId) + addValue;
    if (nextIndex >= availableUnitIds.length) {
      nextIndex = nextIndex % availableUnitIds.length;
    } else if (nextIndex < 0) {
      nextIndex = availableUnitIds.length + (nextIndex % availableUnitIds.length);
    }

    let cost = -1;
    const newUnitId = availableUnitIds[nextIndex];
    if (newUnitId > 0) {
      const unitMaster = this.unitMasterCache.get(newUnitId);
      if (unitMaster) {
        cost = unitMaster.cost;
      }
    }

    unitButton.changeUnit(newUnitId, cost);
  }

  /**
   * ステージの切り替えボタンが押下された時のコールバック
   */
  public onStageArrowTapped(addValue: number): void {
    if (!this.userBattle) {
      return;
    }

    let newStageId;

    const maxStageId = this.userBattle.unlockedStageId;

    if (maxStageId === 1) {
      newStageId = 1;
    } else {
      newStageId = this.currentStageId + addValue;
      if (newStageId > maxStageId) {
        newStageId = newStageId % maxStageId;
      } else if (newStageId <= 0) {
        newStageId = maxStageId + (newStageId % maxStageId);
      }
    }

    this.updateCurrentStageId(newStageId);
  }

  /**
   * OK ボタンが押下されたされたときのコールバック
   */
  public onOkButtonDown(): void {
    this.uiGraph.ok_button_off.visible = false;
  }

  /**
   * OK ボタン押下が離されたされたときのコールバック
   */
  public onOkButtonUp(): void {
    this.uiGraph.ok_button_off.visible = true;
    this.startBattleIfPossible();
  }

  /**
   * 可能であればバトル画面に遷移する
   */
  private startBattleIfPossible(): boolean {
    if (this.transitionIn.isActive() || this.transitionOut.isActive()) {
      return false;
    }

    const params = this.createBattleParameter();
    if (!params) {
      return false;
    }

    const bgm = SoundManager.getSound(ResourceMaster.Audio.Bgm.Title);
    if (bgm) {
      SoundManager.fade(bgm, 0.01, 0.5, true);
    }

    SoundManager.unregisterSound(ResourceMaster.Audio.Bgm.Title);

    GameManager.loadScene(new BattleScene(params));

    return true;
  }

  /**
   * UnitButton を初期化する
   */
  private initUnitButtons(): void {
    this.unitButtons.clear();

    let slotIndex = 0;
    const keys = Object.keys(this.uiGraph);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const entity = this.uiGraph[key];
      if (entity.constructor.name === 'UnitButton') {
        const unitButton = (entity as UnitButton);
        if (this.lastUnitIds.length >= slotIndex + 1) {
          unitButton.init(slotIndex, this.lastUnitIds[slotIndex]);
        } else {
          unitButton.init(slotIndex);
        }
        this.unitButtons.set(slotIndex, unitButton);
        slotIndex++;
        if (slotIndex >= Config.MaxUnitSlotCount) {
          break;
        }
      }
    }
  }

  /**
   * 必要であれば BGM を再生する
   */
  private playBgmIfNeeded(): void {
    const bgmTitleName = ResourceMaster.Audio.Bgm.Title;
    if (!SoundManager.hasSound(bgmTitleName)) {
      const resource = PIXI.loader.resources[bgmTitleName] as any;
      const bgm = SoundManager.createSound(bgmTitleName, resource.buffer);
      bgm.play(true);
    }
  }

  /**
   * 選択されているステージ ID を更新する
   */
  private updateCurrentStageId(stageId: number): void {
    this.currentStageId = stageId;
    (this.uiGraph.stage_number as PIXI.Text).text = `${stageId}`;
  }

  /**
   * バトル用のパラメータを作成する
   */
  private createBattleParameter(): BattleParameter | null {
    if (!this.userBattle) {
      return null;
    }

    const unitIds: number[] = [];
    this.unitButtons.forEach((unitButton) => {
      unitIds.push(unitButton.unitId);
    });

    IndexedDBManager.put('lastStageId', this.currentStageId);
    IndexedDBManager.put('lastUnitOrder', unitIds);

    return {
      unitIds,
      unitSlotCount: Config.MaxUnitSlotCount,
      fieldId: this.currentStageId,
      stageId: this.currentStageId,
      playerBase: this.userBattle.base,
      cost: this.userBattle.cost
    };
  }
}

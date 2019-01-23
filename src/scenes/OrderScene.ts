import Config from  'Config';
import Resource from 'Resource';
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
   * リソースリストを作成し返却する
   */
  protected createInitialResourceList(): Array<LoaderAddParam | string> {
    let assets = super.createInitialResourceList();
    assets.push(Resource.Api.UserBattle(DUMMY_USER_ID));
    assets.push(Resource.Api.AllUnit());
    assets.push(Resource.Audio.Bgm.Title);
    assets.push(Resource.Audio.Se.UnitSpawn);

    return assets;
  }

  /**
   * リソースをロードする
   * 基本実装をオーバーライドし、 indexed db のレコードを取得する
   */
  public beginLoadResource(onLoaded: () => void): Promise<void> {
    // Indexed DB にレコードが存在すれば最後の編成情報を復元する
    return Promise.all([
      new Promise((resolve) => {
        this.loadStageIdFromDB((stageId) => {
          this.currentStageId = stageId || 1;
          resolve()
        });
      }),
      new Promise((resolve) => {
        this.loadUnitIdsFromDB((unitIds) => {
          this.lastUnitIds = unitIds || [];
          resolve()
        });
      })
    ]).then(() => {
      return super.beginLoadResource(onLoaded);
    });
  }

  /**
   * リソースがロードされた時のコールバック
   */
  protected onInitialResourceLoaded(): Array<LoaderAddParam | string> {
    let additionalAssets = super.onInitialResourceLoaded();

    const resources = PIXI.loader.resources;

    this.unitButtonTexturesCache.clear();
    this.unitMasterCache.clear();

    const userBattleUrl = Resource.Api.UserBattle(DUMMY_USER_ID);
    this.userBattle = resources[userBattleUrl].data;

    if (!this.userBattle) {
      throw new Error('user_battle record could not be retrieved');
    }

    const allUnitMaster = resources[Resource.Api.AllUnit()].data;
    for (let i = 0; i < allUnitMaster.length; i++) {
      const unitMaster = allUnitMaster[i];
      this.unitMasterCache.set(unitMaster.unitId, unitMaster);
    }

    const seKey = Resource.Audio.Se.UnitSpawn;
    SoundManager.createSound(seKey, (resources[seKey] as any).buffer);

    for (let i = 0; i < this.userBattle.unlockedUnitIds.length; i++) {
      const unitId = this.userBattle.unlockedUnitIds[i];
      additionalAssets.push(Resource.Dynamic.UnitPanel(unitId));
    }

    return additionalAssets;
  }

  /**
   * 追加リソースダウンロード完了時コールバック
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    if (!this.userBattle) {
      throw new Error('user_battle record missing');
    }
    for (let i = 0; i < this.userBattle.unlockedUnitIds.length; i++) {
      const unitId = this.userBattle.unlockedUnitIds[i];
      const url = Resource.Dynamic.UnitPanel(unitId);
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

    this.playSe(Resource.Audio.Se.UnitSpawn);
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

    this.playSe(Resource.Audio.Se.UnitSpawn);
  }

  /**
   * OK ボタンが押下されたされたときのコールバック
   */
  public onOkButtonDown(): void {
    this.uiGraph.ok_button_off.visible = false;
    this.playSe(Resource.Audio.Se.UnitSpawn);
  }

  /**
   * OK ボタン押下が離されたされたときのコールバック
   */
  public onOkButtonUp(): void {
    this.uiGraph.ok_button_off.visible = true;
    this.startBattleIfPossible();
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

    this.fadeOutBgm();
    SoundManager.unregisterSound(Resource.Audio.Bgm.Title);

    this.saveStageIdToDB(params.stageId);
    this.saveUnitIdsToDB(params.unitIds);

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

    return {
      unitIds,
      unitSlotCount: Config.MaxUnitSlotCount,
      stageId: this.currentStageId,
      playerBase: this.userBattle.base,
      cost: this.userBattle.cost
    };
  }

  /**
   * 必要であれば BGM を再生する
   */
  private playBgmIfNeeded(): void {
    const bgmTitleName = Resource.Audio.Bgm.Title;
    if (!SoundManager.hasSound(bgmTitleName)) {
      const resource = PIXI.loader.resources[bgmTitleName] as any;
      const bgm = SoundManager.createSound(bgmTitleName, resource.buffer);
      bgm.play(true);
    }
  }

  /**
   * DB へユニットID配列を保存する
   */
  private saveUnitIdsToDB(unitIds: number[]): void {
    IndexedDBManager.put('lastUnitOrder', unitIds);
  }
  /**
   * DB からユニットID配列を取得する
   */
  private loadUnitIdsFromDB(callback: (unitIds: number[]) => void): void {
    IndexedDBManager.get('lastUnitOrder', (unitIds) => callback(unitIds));
  }
  /**
   * DB へステージIDを保存する
   */
  private saveStageIdToDB(stageId: number): void {
    IndexedDBManager.put('lastStageId', stageId);
  }
  /**
   * DB からステージIDを取得する
   */
  private loadStageIdFromDB(callback: (stageId: number) => void): void {
    IndexedDBManager.get('lastStageId', (stageId) => callback(stageId));
  }

  /**
   * BGM をフェードアウトする
   */
  private fadeOutBgm(): void {
    const bgm = SoundManager.getSound(Resource.Audio.Bgm.Title);
    if (bgm) {
      SoundManager.fade(bgm, 0.01, 0.5, true);
    }
  }
}

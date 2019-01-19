import ResourceMaster from 'ResourceMaster';
import GameManager from 'managers/GameManager';
import SoundManager from 'managers/SoundManager';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import BattleParameter from 'interfaces/BattleParameter';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';
import FadeIn from 'scenes/transition/FadeIn';
import FadeOut from 'scenes/transition/FadeOut';

const debugParams: BattleParameter = {
  maxUnitSlotCount: 5,
  fieldId: 1,
  stageId: 1,
  unitIds: [1, -1, 3, -1, 5],
  baseIdMap: {
    player: 1,
    ai: 2
  },
  playerBaseParams: {
    maxHealth: 100
  },
  cost: {
    recoveryPerFrame: 0.05,
    max: 100
  }
};

/**
 * タイトルシーン
 */
export default class TitleScene extends Scene  {
  constructor() {
    super();
    this.transitionIn  = new FadeIn();
    this.transitionOut = new FadeOut();

    this.interactive = true;
    this.on('pointerup', () => this.startBattle());
  }

  protected createResourceList(): LoaderAddParam[] {
    const assets = super.createResourceList();
    const bgmTitleName = ResourceMaster.Audio.Bgm.Title;
    assets.push({ name: bgmTitleName, url: bgmTitleName });
    return assets;
  }

  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const bgmTitleName = ResourceMaster.Audio.Bgm.Title;
    const resource = PIXI.loader.resources[bgmTitleName] as any;
    const bgm = SoundManager.instance.createSound(bgmTitleName, resource.buffer);
    bgm.play(true);
  }

  /**
   * ゲーム開始ボタン押下が離されたされたときのコールバック
   */
  public startBattle(): void {
    if (this.transitionIn.isActive() || this.transitionOut.isActive()) {
      return;
    }

    const soundManager = SoundManager.instance;
    const bgm = soundManager.getSound(ResourceMaster.Audio.Bgm.Title);
    if (bgm) {
      soundManager.fade(bgm, 0.01, 0.5, true);
    }

    soundManager.unregisterSound(ResourceMaster.Audio.Bgm.Title);

    const params: BattleParameter = debugParams;

    GameManager.loadScene(new BattleScene(params));
  }
}

import ResourceMaster from 'ResourceMaster';
import GameManager from 'managers/GameManager';
import SoundManager from 'managers/SoundManager';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Sound from 'modules/Sound';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';
import FadeIn from 'scenes/transition/FadeIn';
import FadeOut from 'scenes/transition/FadeOut';

/**
 * タイトルシーン
 */
export default class TitleScene extends Scene  {

  private bgm: Sound | null = null;

  constructor() {
    super();
    this.transitionIn  = new FadeIn();
    this.transitionOut = new FadeOut();
  }

  protected createResourceList(): LoaderAddParam[] {
    const assets = super.createResourceList();
    assets.push({ name: ResourceMaster.Audio.TitleBgm, url: ResourceMaster.Audio.TitleBgm });
    return assets;
  }

  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const resource: any = PIXI.loader.resources[ResourceMaster.Audio.TitleBgm];
    this.bgm = new Sound(resource.buffer);
    this.bgm.loop = true;
    this.bgm.play();
  }

  /**
   * ゲーム開始ボタンが押下されたときのコールバック
   */
  public onGameStartTappedDown(): void {
    if (!this.transitionIn.isFinished()) {
      return;
    }
    this.uiGraph.title_off.alpha = 0;
  }
  /**
   * ゲーム開始ボタン押下が離されたされたときのコールバック
   */
  public onGameStartTappedUp(): void {
    if (!this.transitionIn.isFinished()) {
      return;
    }
    this.uiGraph.title_off.alpha = 1;
    if (this.bgm) {
      SoundManager.instance.fade(this.bgm, 0.01, 0.5, true);
    }
    GameManager.loadScene(new BattleScene());
  }
}

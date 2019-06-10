import Resource from 'Resource';
import GameManager from 'managers/GameManager';
import SoundManager from 'managers/SoundManager';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
import OrderScene from 'scenes/OrderScene';
import Fade from 'scenes/transition/Fade';

/**
 * タイトルシーン
 */
export default class TitleScene extends Scene  {
  /**
   * TOUCH TO START テキストの明滅感覚
   */
  private readonly textAppealDuration: number = 20;

  /**
   * コンストラクタ
   */
  constructor() {
    super();

    this.transitionIn  = new Fade(1.0, 0.0, -0.02);
    this.transitionOut = new Fade(0.0, 1.0, 0.02);

    this.interactive = true;
    this.on('pointerup', () => this.startOrder());
  }

  /**
   * リソースリストを作成し返却する
   */
  protected createInitialResourceList(): (LoaderAddParam | string)[] {
    const assets = super.createInitialResourceList();
    assets.push(Resource.Audio.Bgm.Title);
    return assets;
  }

  /**
   * リソースがロードされた時のコールバック
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const loader = GameManager.instance.game.loader;
    const bgmTitleName = Resource.Audio.Bgm.Title;
    const resource = loader.resources[bgmTitleName] as any;
    SoundManager.createSound(bgmTitleName, resource.buffer);

    this.playBgm(Resource.Audio.Bgm.Title);
  }

  /**
   * 毎フレームの更新処理
   */
  public update(dt: number): void {
    super.update(dt);

    if (this.elapsedFrameCount % this.textAppealDuration === 0) {
      const visible = this.uiGraph.touch_to_start.visible;
      this.uiGraph.touch_to_start.visible = !visible;
    }
  }

  /**
   * 編成ボタンが離されたときのコールバック
   */
  public startOrder(): void {
    if (this.transitionIn.isActive() || this.transitionOut.isActive()) {
      return;
    }

    GameManager.loadScene(new OrderScene());
  }
}

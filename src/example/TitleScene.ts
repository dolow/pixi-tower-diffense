import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import GameManager from 'example/GameManager';
import Resource from 'example/Resource';
import Scene from 'example/Scene';
import Fade from 'example/transition/Fade';
import Sound from 'example/Sound';

/**
 * タイトルシーン
 */
export default class TitleScene extends Scene  {
  /**
   * テキストを明滅させる間隔
   */
  private readonly textAppealDuration: number = 20;
  /**
   * TOUCH TI START のテキスト
   */
  private text!: PIXI.Text;

  /**
   * コンストラクタ
   */
  constructor() {
    super();

    this.transitionIn  = new Fade(1.0, 0.0, -0.02);
    this.transitionOut = new Fade(0.0, 1.0, 0.02);

    this.interactive = true;
    this.on('pointerup', () => this.showOrderScene());
  }

  /**
   * リソースリストを作成し返却する
   */
  protected createInitialResourceList(): (LoaderAddParam | string)[] {
    let assets = super.createInitialResourceList();
    const staticResource = Resource.Static;
    assets = assets.concat(staticResource.BattleBgFores.slice(0, 3));
    assets = assets.concat(staticResource.BattleBgMiddles.slice(0, 3));
    assets = assets.concat(staticResource.BattleBgBacks.slice(0, 3));
    assets.push(Resource.Audio.Bgm.Title);
    return assets;
  }

  /**
   * リソースがロードされた時のコールバック
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    const renderer = GameManager.instance.game.renderer;
    const resources = PIXI.loader.resources;

    const bgOrder = [
      Resource.Static.BattleBgBacks,
      Resource.Static.BattleBgMiddles,
      Resource.Static.BattleBgFores
    ];

    for (let i = 0; i < bgOrder.length; i++) {
      const bgs = bgOrder[i];
      for (let j = 0; j < 3; j++) {
        const sprite = new PIXI.Sprite(resources[bgs[j]].texture);
        sprite.position.set(sprite.width * j, 0);
        this.addChild(sprite);
      }
    }

    this.text = new PIXI.Text('TOUCH TO START', new PIXI.TextStyle({
      fontFamily: 'MisakiGothic',
      fontSize: 64,
      fill: 0xffffff,
      padding: 14
    }));
    this.text.anchor.set(0.5, 0.5);
    this.text.position.set(renderer.width * 0.5, renderer.height * 0.5);
    this.addChild(this.text);

    const sound = new Sound((resources[Resource.Audio.Bgm.Title] as any).buffer);
    sound.play();
  }

  public update(dt: number): void {
    super.update(dt);

    if (this.elapsedFrameCount % this.textAppealDuration === 0) {
      const visible = this.text.visible;
      this.text.visible = !visible;
    }
  }

  /**
   * 編成ボタンが離されたときのコールバック
   */
  public showOrderScene(): void {
    console.log("should go to order scene");
  }
}

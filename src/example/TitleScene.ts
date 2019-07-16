import * as PIXI from 'pixi.js';
import GameManager from './GameManager';
import Scene from './Scene';
import Resource from './Resource';
import Fade from './transition/Fade';
import LoaderAddParam from '../interfaces/PixiTypePolyfill/LoaderAddParam';

export default class TitleScene extends Scene  {
  private text!: PIXI.Text;

  constructor() {
    super();

    this.transitionIn  = new Fade(1.0, 0.0, -0.02);
    this.transitionOut = new Fade(0.0, 1.0, 0.02);
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
  protected onResourceLoaded(): (LoaderAddParam | string)[] {
    super.onResourceLoaded();
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

    const renderer = GameManager.instance.game.renderer;

    this.text = new PIXI.Text('TOUCH TO START', new PIXI.TextStyle({
      fontSize: 64,
      fill: 0xffffff
    }));
    this.text.anchor.set(0.5, 0.5);
    this.text.position.set(renderer.width * 0.5, renderer.height * 0.5);
    this.addChild(this.text);

    this.interactive = true;
    this.on('pointerup', () => this.showOrderScene());

    return [];
  }

  /**
   * タップされたときのコールバック
   */
  public showOrderScene(): void {
    console.log("should go to order scene");
  }
}

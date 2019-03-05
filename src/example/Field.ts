import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';

/**
 * ユニットや拠点が配置されるバトル背景のクラス
 */
export default class Field extends PIXI.Container {
  /**
   * 表示上の前後関係を制御するための PIXI.Container オブジェクト
   */
  private containers: { [key: string]: PIXI.Container } = {
    fore:   new PIXI.Container(),
    middle: new PIXI.Container(),
    back:   new PIXI.Container()
  };

  /**
   * このクラスで利用するリソースリスト
   */
  public static get resourceList(): string[] {
    const list: string[] = ([] as string[]).concat(
      Resource.Static.BattleBgFores,
      Resource.Static.BattleBgMiddles,
      Resource.Static.BattleBgBacks
    );

    return list;
  }

  /**
   * フィールドの長さとユニットを配置するラインの数で初期化する
   */
  public init(): void {
    const resource = Resource.Static;
    this.addOrderedSprites(resource.BattleBgFores,   this.containers.fore);
    this.addOrderedSprites(resource.BattleBgMiddles, this.containers.middle);
    this.addOrderedSprites(resource.BattleBgBacks,   this.containers.back);
    // addChild 順に描画される
    this.addChild(this.containers.back);
    this.addChild(this.containers.middle);
    this.addChild(this.containers.fore);
  }

  /**
   * 背景スプライトを追加
   */
  private addOrderedSprites(names: string[], parent: PIXI.Container): void {
    let x = 0;
    for (let i = 0; i < names.length; i++) {
      const texture = PIXI.loader.resources[names[i]].texture;
      const sprite = new PIXI.Sprite(texture);
      sprite.position.x = x;
      x += sprite.width;
      parent.addChild(sprite);
    }
  }
}

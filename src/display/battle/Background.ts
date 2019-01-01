import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';

export default class Background extends PIXI.Container {
  private static resourceListCache: string[] = [];

  public static get resourceList(): string[] {
    if (Background.resourceListCache.length === 0) {
      const tiles = ResourceMaster.BattleBgFore();
      for (let i = 0; i < tiles.length; i++) {
        Background.resourceListCache.push(tiles[i]);
      }
    }
    return Background.resourceListCache;
  }

  public init(): void {
    const list = Background.resourceList;
    let x = 0;
    for (let i = 0; i < list.length; i++) {
      const texture = PIXI.loader.resources[list[i]].texture;
      const sprite = new PIXI.Sprite(texture);
      sprite.position.x = x;
      x += sprite.width;
      this.addChild(sprite);
    }
  }
}

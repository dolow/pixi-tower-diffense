import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import GameManager from 'managers/GameManager';

export default class Field extends PIXI.Container {
  private static resourceListCache: string[] = [];

  private pointerDownCount: number = 0;
  private lastPointerPositionX: number = 0;

  private foregroundScrollLimit: number = -1;

  private containers: { [key: string]: PIXI.Container } = {
    fore: new PIXI.Container(),
    middle: new PIXI.Container(),
    back: new PIXI.Container()
  };

  private foreZLines: PIXI.Container[] = [];

  public static get resourceList(): string[] {
    if (Field.resourceListCache.length === 0) {
      const foreTiles   = ResourceMaster.BattleBgFore();
      const middleTiles = ResourceMaster.BattleBgMiddle();
      const backTiles   = ResourceMaster.BattleBgBack();
      Field.resourceListCache = Field.resourceListCache.concat(foreTiles);
      Field.resourceListCache = Field.resourceListCache.concat(middleTiles);
      Field.resourceListCache = Field.resourceListCache.concat(backTiles);
    }
    return Field.resourceListCache;
  }

  constructor() {
    super();

    // ユーザ操作で画面をスクロールできるようにする
    this.interactive = true;
    this.on('pointerdown',   (e: PIXI.interaction.InteractionEvent) => this.onPointerDown(e));
    this.on('pointermove',   (e: PIXI.interaction.InteractionEvent) => this.onPointerMove(e));
    this.on('pointercancel', (e: PIXI.interaction.InteractionEvent) => this.onPointerUp(e));
    this.on('pointerup',     (e: PIXI.interaction.InteractionEvent) => this.onPointerUp(e));
    this.on('pointerout',    (e: PIXI.interaction.InteractionEvent) => this.onPointerUp(e));
  }

  public init(zLines: number = 8): void {
    const tiles: { [key: string]: string[] } = {
      fore:   ResourceMaster.BattleBgFore(),
      middle: ResourceMaster.BattleBgMiddle(),
      back:   ResourceMaster.BattleBgBack()
    };

    const layers = Object.keys(tiles);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const layerTiles = tiles[layer];
      let x = 0;
      for (let j = 0; j < layerTiles.length; j++) {
        const texture = PIXI.loader.resources[layerTiles[j]].texture;
        const sprite = new PIXI.Sprite(texture);
        sprite.position.x = x;
        x += sprite.width;
        this.containers[layer].addChild(sprite);
      }
    }

    this.addChild(this.containers.back);
    this.addChild(this.containers.middle);
    this.addChild(this.containers.fore);

    // フィールドに奥行きを出すためにユニットを前後に配置できるようにする
    // z-index の後からの制御はコストが高いため、予め PIXI.Container を割り当てておく
    for (let i = 0; i < zLines; i++) {
      const line = new PIXI.Container();
      this.foreZLines.push(line);
      this.containers.fore.addChild(line);
    }

    const screenWidth = GameManager.instance.game.screen.width;
    this.foregroundScrollLimit = -(this.width - screenWidth);
  }

  public addChildToRandomZLine(container: PIXI.Container): void {
    const index = Math.floor(Math.random() * this.foreZLines.length);
    container.position.y = 200 + index * 16;
    this.foreZLines[index].addChild(container);
  }

  private onPointerDown(event: PIXI.interaction.InteractionEvent): void {
    this.pointerDownCount++;
    if (this.pointerDownCount === 1) {
      this.lastPointerPositionX = event.data.global.x;
    }
  }

  private onPointerMove(event: PIXI.interaction.InteractionEvent): void {
    if (this.pointerDownCount <= 0) {
      return;
    }

    const xPos = event.data.global.x;
    const distance = xPos - this.lastPointerPositionX;

    let newForegroundPos = this.position.x + distance;

    if (newForegroundPos > 0) {
      newForegroundPos = 0;
    } else if (newForegroundPos < this.foregroundScrollLimit) {
      newForegroundPos = this.foregroundScrollLimit;
    }

    // 背景に奥行きを出すために前景・中景・後景に分けてスクロール量を変化させる
    this.position.x = newForegroundPos;
    this.containers.middle.position.x = newForegroundPos * -0.6;
    this.containers.back.position.x   = newForegroundPos * -0.9;

    this.lastPointerPositionX = xPos;
  }

  private onPointerUp(_: PIXI.interaction.InteractionEvent): void {
    this.pointerDownCount--;
    if (this.pointerDownCount < 0) {
      this.pointerDownCount = 0;
    }
  }
}

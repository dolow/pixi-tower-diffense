import * as PIXI from 'pixi.js';
import Resource from 'Resource';
import GameManager from 'managers/GameManager';

/**
 * ユニットや拠点が配置されるバトル背景のクラス
 */
export default class Field extends PIXI.Container {
  /**
   * タップダウン数カウント
   * タップダウン重複処理を防止するために数える
   */
  private pointerDownCount: number = 0;
  /**
   * タップ位置の X 座標
   * スクロール処理のために保持する
   */
  private lastPointerPositionX: number = 0;

  /**
   * スクロールの限界座標値
   */
  private foregroundScrollLimit: number = -1;

  /**
   * 表示上の前後関係を制御するための PIXI.Container オブジェクト
   */
  private containers: { [key: string]: PIXI.Container } = {
    foreForegroundEffect: new PIXI.Container(),
    fore: new PIXI.Container(),
    foreBackgroundEffect: new PIXI.Container(),
    middle: new PIXI.Container(),
    back: new PIXI.Container()
  };

  /**
   * ユニットが配置される前景の PIXI.Container 配列
   */
  private foreZLines: PIXI.Container[] = [];

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
   * foreZLines の要素の数を返す
   */
  public get zLineCount(): number {
    return this.foreZLines.length;
  }

  /**
   * コンストラクタ
   */
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

  /**
   * フィールドの長さとユニットを配置するラインの数で初期化する
   */
  public init(options: any = { fieldLength: 3000, zLines: 8 }): void {
    const tiles: { [key: string]: string[] } = {
      fore:   Resource.Static.BattleBgFores,
      middle: Resource.Static.BattleBgMiddles,
      back:   Resource.Static.BattleBgBacks
    };

    // 前景、中景、後景の Sprite を作成する
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

    // addChild 順に描画される
    this.addChild(this.containers.back);
    this.addChild(this.containers.middle);
    this.addChild(this.containers.fore);
    this.containers.fore.addChild(this.containers.foreBackgroundEffect);
    this.addChild(this.containers.foreForegroundEffect);

    // フィールドに奥行きを出すためにユニットを前後に配置できるようにする
    // z-index の後からの制御はコストが高いため、予め PIXI.Container を割り当てておく
    for (let i = 0; i < options.zLines; i++) {
      const line = new PIXI.Container();
      this.foreZLines.push(line);
      this.containers.fore.addChild(line);
    }

    // 的拠点よりも少し後ろを見せるための余剰スクロール範囲
    const spareLength = GameManager.instance.game.view.width * 0.75;
    this.foregroundScrollLimit = -(options.fieldLength - spareLength);
  }

  /**
   * 前景内で背景エフェクトとして addChild する
   */
  public addChildAsForeBackgroundEffect(container: PIXI.Container): void {
    this.containers.foreBackgroundEffect.addChild(container);
  }
  /**
   * 前景内で前景エフェクトとして addChild する
   */
  public addChildAsForeForegroundEffect(container: PIXI.Container): void {
    this.containers.foreForegroundEffect.addChild(container);
  }
  /**
   * 指定した zLine インデックスの PIXI.Container に addChild する
   */
  public addChildToZLine(container: PIXI.Container, zlineIndex: number): void {
    container.position.y = 260 + zlineIndex * 16;
    this.foreZLines[zlineIndex].addChild(container);
  }

  /**
   * タップ押下時の制御コールバック
   */
  private onPointerDown(event: PIXI.interaction.InteractionEvent): void {
    this.pointerDownCount++;
    if (this.pointerDownCount === 1) {
      this.lastPointerPositionX = event.data.global.x;
    }
  }

  /**
   * タップ移動時の制御コールバック
   */
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

  /**
   * タップ終了時の制御コールバック
   */
  private onPointerUp(_: PIXI.interaction.InteractionEvent): void {
    this.pointerDownCount--;
    if (this.pointerDownCount < 0) {
      this.pointerDownCount = 0;
    }
  }
}

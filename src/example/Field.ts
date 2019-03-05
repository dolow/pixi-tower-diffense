import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';

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
  private foregroundScrollLimit: number = -2000;

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
   * コンストラクタ
   */
  constructor() {
    super();

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

    let newForegroundPos = this.containers.fore.position.x + distance;

    if (newForegroundPos > 0) {
      newForegroundPos = 0;
    } else if (newForegroundPos < this.foregroundScrollLimit) {
      newForegroundPos = this.foregroundScrollLimit;
    }

    // 背景に奥行きを出すために前景・中景・後景に分けてスクロール量を変化させる
    this.containers.fore.position.x   = newForegroundPos;
    this.containers.middle.position.x = newForegroundPos * 0.5;
    this.containers.back.position.x   = newForegroundPos * 0.2;

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

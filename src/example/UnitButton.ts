import * as PIXI from 'pixi.js';
import Resource from 'example/Resource';

/**
 * ユニット生成をリクエストするための UI 用のボタン
 */
export default class UnitButton extends PIXI.Container {
  /**
   * ボタン枠のインデックス
   */
  public slotIndex: number = -1;
  /**
   * ボタンに割り当てられたユニットの ID
   */
  public unitId: number = -1;
  /**
   * 表示するユニットコスト
   */
  public cost: number = -1;

  /**
   * ボタン画像
   */
  private button!: PIXI.Sprite;
  /**
   * コストテキスト
   */
  private text!: PIXI.Text;
  /**
   * フィルター
   */
  private filter: PIXI.filters.ColorMatrixFilter = new PIXI.filters.ColorMatrixFilter();

  /**
   * コンストラクタ
   */
  constructor(texture?: PIXI.Texture) {
    super();

    this.button = new PIXI.Sprite();
    this.text = new PIXI.Text('', {
      fontFamily: Resource.FontFamily.Default,
      fontSize: 24,
      fill: 0xffffff,
      padding: 4
    });

    this.filter.desaturate();
    this.toggleFilter(false);

    this.text.position.set(46, 88);

    if (texture) {
      this.button.texture = texture;
    }

    this.addChild(this.button);
    this.addChild(this.text);
  }

  /**
   * ボタン枠インデックスとユニット ID で初期化する
   */
  public init(slotIndex: number, unitId: number = -1, cost: number = -1): void {
    const texture = this.getTexture(unitId);
    if (!texture) {
      return;
    }

    this.slotIndex = slotIndex;
    this.unitId = unitId;
    this.button.texture = texture;
    this.text.text = (cost >= 0) ? `${cost}` : '';
  }

  /**
   * ColorMatrixFilter の有効/無効を切り替える
   */
  public toggleFilter(enabled: boolean): void {
    this.button.filters = enabled ? [this.filter] : null;
  }

  /**
   * ユニットを変更する
   */
  public changeUnit(unitId: number = -1, cost: number = -1): void {
    const texture = this.getTexture(unitId);
    if (!texture) {
      return;
    }

    this.unitId  = unitId;
    this.button.texture = texture;
    this.text.text = (cost >= 0) ? `${cost}` : '';
  }

  /**
   * 指定したユニット ID のテクスチャを変更する
   */
  private getTexture(unitId: number = -1): PIXI.Texture | null {
    const resourceId = Resource.Dynamic.UnitPanel(unitId);
    const resource = PIXI.loader.resources[resourceId];
    if (!resource || !resource.texture) {
      return null;
    }
    return resource.texture;
  }
}

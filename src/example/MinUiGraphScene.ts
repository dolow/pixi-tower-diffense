import AbstractUiGraphScene from 'example/AbstractUiGraphScene';

/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class MinUiGraphScene extends AbstractUiGraphScene  {
  /**
   * UI 情報として定義されたイベントコールバックメソッド
   */
  public onStageArrowTapped(...args: any[]): void {
    console.log('onStageArrowTapped invoked!!', args);
  }
  public onUnitArrowTapped(...args: any[]): void {
    console.log('onUnitArrowTapped invoked!!', args);
  }
  public onOkButtonDown(...args: any[]): void {
    console.log('onOkButtonDown invoked!!', args);
    this.uiGraph.ok_button_off.visible = false;
  }
  public onOkButtonUp(...args: any[]): void {
    console.log('onOkButtonUp invoked!!', args);
    this.uiGraph.ok_button_off.visible = true;
  }
}

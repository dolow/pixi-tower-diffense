import Resource from 'example/Resource';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import UiNodeFactory from 'example/factory/UiNodeFactory';
import UnitButtonFactory from 'example/factory/UnitButtonFactory';
import UnitButton from 'example/UnitButton';

const dummyUnitIds = [1, 2, 3, 4, -1];
const dummyCosts   = [10, 20, 30, 40, -1];

/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class OrderScene extends Scene  {
  /**
   * 独自 UiGraph 要素のファクトリを返す
   * このシーンでは UnitButton をカスタム UI 要素として持っている
   */
  protected getCustomUiGraphFactory(type: string): UiNodeFactory | null {
    if (type === 'unit_button') {
      return new UnitButtonFactory();
    }
    return null;
  }

  /**
   * リソースがロードされた時のコールバック
   */
  protected onInitialResourceLoaded(): (LoaderAddParam | string)[] {
    const additionalAssets = super.onInitialResourceLoaded();

    for (let i = 0; i < dummyUnitIds.length; i++) {
      additionalAssets.push(Resource.Dynamic.UnitPanel(dummyUnitIds[i]));
    }

    return additionalAssets;
  }

  /**
   * リソースロード完了後に実行されるコールバック
   * UnitButton の初期化を行う
   */
  protected onResourceLoaded(): void {
    super.onResourceLoaded();

    let slotIndex = 0;
    const keys = Object.keys(this.uiGraph);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const entity = this.uiGraph[key];
      if (entity.constructor.name !== 'UnitButton') {
        continue;
      }

      const unitButton = (entity as UnitButton);
      if (dummyCosts[slotIndex] === -1) {
        unitButton.init(slotIndex, dummyUnitIds[slotIndex]);
      } else {
        unitButton.init(slotIndex, dummyUnitIds[slotIndex], dummyCosts[slotIndex]);
      }
      slotIndex++;
    }
  }

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

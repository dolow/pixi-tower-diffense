import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';

/**
 * PIXI.Text のファクトリ
 */
export default class TextFactory extends UiNodeFactory {
  public createUiNode(nodeParams?: UI.TextNodeParams): PIXI.Container | null {
    const textStyleParams: PIXI.TextStyleOptions = {};

    let text = '';

    if (nodeParams) {
      if (nodeParams.size !== undefined) {
        textStyleParams.fontSize = nodeParams.size;
      }
      if (nodeParams.color !== undefined) {
        textStyleParams.fill = nodeParams.color;
      }
      if (nodeParams.text !== undefined) {
        text = nodeParams.text;
      }
    }

    return new PIXI.Text(text, new PIXI.TextStyle(textStyleParams));
  }
}

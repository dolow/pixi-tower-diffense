import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'example/factory/UiNodeFactory';

/**
 * PIXI.Text のファクトリ
 */
export default class TextFactory extends UiNodeFactory {
  public createUiNode(nodeParams?: UI.TextNodeParams): PIXI.Container | null {
    const textStyleParams: PIXI.TextStyleOptions = {};

    const container = new PIXI.Text();

    if (nodeParams) {
      if (nodeParams.family !== undefined) {
        textStyleParams.fontFamily = nodeParams.family;
      }
      if (nodeParams.size !== undefined) {
        textStyleParams.fontSize = nodeParams.size;
      }
      if (nodeParams.color !== undefined) {
        textStyleParams.fill = nodeParams.color;
      }
      if (nodeParams.padding !== undefined) {
        textStyleParams.padding = nodeParams.padding;
      }
      if (nodeParams.anchor !== undefined) {
        container.anchor.set(...nodeParams.anchor);
      }
      if (nodeParams.text !== undefined) {
        container.text = nodeParams.text;
      }
    }

    container.style = new PIXI.TextStyle(textStyleParams);

    return container;
  }
}

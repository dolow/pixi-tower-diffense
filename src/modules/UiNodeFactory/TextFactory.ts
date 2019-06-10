import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
import TextStyleOptionsV5 from 'interfaces/pixiv5/TextStyleOptionsV5';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';

/**
 * PIXI.Text のファクトリ
 */
export default class TextFactory extends UiNodeFactory {
  public createUiNode(nodeParams?: UI.TextNodeParams): PIXI.Container | null {
    const textStyleParams: TextStyleOptionsV5 = {};

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
    }

    const style = new PIXI.TextStyle(textStyleParams);
    const container = new PIXI.Text(
      nodeParams && nodeParams.text ? nodeParams.text : '',
      style
    );

    if (nodeParams && nodeParams.anchor !== undefined) {
      container.anchor.set(...nodeParams.anchor);
    }

    return container;
  }
}

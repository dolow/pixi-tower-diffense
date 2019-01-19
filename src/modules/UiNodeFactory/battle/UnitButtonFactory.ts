import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UnitButton from 'display/battle/UnitButton';

/**
 * バトルで用いる UnitButton のファクトリ
 * UnitButton インスタンスを返す
 */
export default class UnitButtonFactory extends UiNodeFactory {
  public createUiNode(nodeParams?: UI.SpriteNodeParams): PIXI.Container | null {
    let texture = undefined;

    if (nodeParams) {
      if (nodeParams.textureName && PIXI.utils.TextureCache[nodeParams.textureName]) {
        texture = PIXI.utils.TextureCache[nodeParams.textureName];
      }
    }

    return new UnitButton(texture);
  }
}

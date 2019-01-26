import * as PIXI from 'pixi.js';
import * as UI from 'example/interfaces/UiGraph/index';
import UiNodeFactory from 'example/factory/UiNodeFactory';
import UnitButton from 'example/UnitButton';

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

import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';

/**
 * PIXI.Sprite のファクトリ
 * テクスチャに、定義されているテクスチャ名で PIXI.utils.TextureCache から引いたデータを用いる
 */
export default class SpriteFactory extends UiNodeFactory {
  public createUiNode(nodeParams?: UI.SpriteNodeParams): PIXI.Container | null {
    let texture = undefined;

    if (nodeParams) {
      if (nodeParams.textureName && PIXI.utils.TextureCache[nodeParams.textureName]) {
        texture = PIXI.utils.TextureCache[nodeParams.textureName];
      }
    }

    return new PIXI.Sprite(texture);
  }
}

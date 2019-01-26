/// <reference types="pixi.js" />
import * as UI from 'example/interfaces/UiGraph/index';
import UiNodeFactory from 'example/factory/UiNodeFactory';
/**
 * PIXI.Sprite のファクトリ
 * テクスチャに、定義されているテクスチャ名で PIXI.utils.TextureCache から引いたデータを用いる
 */
export default class SpriteFactory extends UiNodeFactory {
    createUiNode(nodeParams?: UI.SpriteNodeParams): PIXI.Container | null;
}

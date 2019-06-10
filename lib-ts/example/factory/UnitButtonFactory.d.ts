import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'example/factory/UiNodeFactory';
/**
 * バトルで用いる UnitButton のファクトリ
 * UnitButton インスタンスを返す
 */
export default class UnitButtonFactory extends UiNodeFactory {
    createUiNode(nodeParams?: UI.SpriteNodeParams): PIXI.Container | null;
}

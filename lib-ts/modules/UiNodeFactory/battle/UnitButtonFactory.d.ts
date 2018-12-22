import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default class UnitButtonFactory extends UiNodeFactory {
    createUiNode(nodeParams?: UI.SpriteNodeParams): PIXI.Container | null;
}

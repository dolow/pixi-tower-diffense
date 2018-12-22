/// <reference types="pixi.js" />
import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default class SpriteFactory extends UiNodeFactory {
    createUiNode(nodeParams?: UI.SpriteNodeParams): PIXI.Container | null;
}

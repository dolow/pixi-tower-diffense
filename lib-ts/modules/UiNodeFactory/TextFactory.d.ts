/// <reference types="pixi.js" />
import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default class TextFactory extends UiNodeFactory {
    createUiNode(nodeParams?: UI.TextNodeParams): PIXI.Container | null;
}

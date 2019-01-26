/// <reference types="pixi.js" />
import * as UI from 'example/interfaces/UiGraph/index';
import UiNodeFactory from 'example/factory/UiNodeFactory';
/**
 * PIXI.Text のファクトリ
 */
export default class TextFactory extends UiNodeFactory {
    createUiNode(nodeParams?: UI.TextNodeParams): PIXI.Container | null;
}

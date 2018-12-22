import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
export default class UiNodeFactory {
    createUiNode(_?: UI.NodeParams): PIXI.Container | null;
    createUiNodeByGraphElement(nodeData: UI.Node): PIXI.Container | null;
    attachUiEventByGraphElement(events: UI.Event[], node: PIXI.Container, target: any): void;
}

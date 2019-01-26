import * as PIXI from 'pixi.js';
import * as UI from 'example/interfaces/UiGraph/index';
/**
 * UiGraph 要素のファクトリの基本クラス
 */
export default class UiNodeFactory {
    /**
     * 派生クラスで実装し、適切な UiGraph ノードを生成する
     * デフォルトでは PIXI.Container インスタンスを返す
     */
    createUiNode(_?: UI.NodeParams): PIXI.Container | null;
    /**
     * 静的なノードデータから PIXI.Container 派生オブジェクトを生成する
     */
    createUiNodeByGraphElement(nodeData: UI.Node): PIXI.Container | null;
    /**
     * 定義されたイベントを実装する
     */
    attachUiEventByGraphElement(events: UI.Event[], node: PIXI.Container, target: any): void;
}

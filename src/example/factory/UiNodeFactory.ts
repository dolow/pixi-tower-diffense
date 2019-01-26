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
  public createUiNode(_?: UI.NodeParams): PIXI.Container | null {
    return new PIXI.Container();
  }

  /**
   * 静的なノードデータから PIXI.Container 派生オブジェクトを生成する
   */
  public createUiNodeByGraphElement(nodeData: UI.Node): PIXI.Container | null {
    const node = this.createUiNode(nodeData.params);

    if (node) {
      node.name = nodeData.id;
      node.position.set(nodeData.position[0], nodeData.position[1]);
    }

    return node;
  }

  /**
   * 定義されたイベントを実装する
   */
  public attachUiEventByGraphElement(events: UI.Event[], node: PIXI.Container, target: any): void {
    node.interactive = true;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const fx = target[event.callback];
      if (!fx) {
        continue;
      }

      node.on(event.type, () => fx.call(target, ...event.arguments));
    }
  }
}

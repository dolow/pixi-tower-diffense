import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';

export default class UiNodeFactory {
  public createUiNode(_?: UI.NodeParams): PIXI.Container | null {
    return new PIXI.Container();
  }

  public createUiNodeByGraphElement(nodeData: UI.Node): PIXI.Container | null {
    const node = this.createUiNode(nodeData.params);

    if (node) {
      node.name = nodeData.id;
      node.position.set(nodeData.position[0], nodeData.position[1]);
    }

    return node;
  }

  public attachUiEventByGraphElement(
    events: UI.Event[],
    node: PIXI.Container,
    target: any
  ): void {
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

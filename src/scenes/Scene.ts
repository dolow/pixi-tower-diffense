import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import * as UI from 'interfaces/UiGraph/index';
import UiGraph from 'modules/UiGraph';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';

export default abstract class Scene extends PIXI.Container {
  protected hasSceneUiGraph: boolean = true;
  protected uiGraph!: { [key: string]: PIXI.Container };
  protected uiGraphContainer: PIXI.Container = new PIXI.Container();

  constructor() {
    super();

    this.uiGraph = {};
  }

  public update(_: number): void {

  }

  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void {
    onTransitionFinished(this);
  }

  public beginTransitionOut(onTransitionFinished: (scene: Scene) => void): void {
    onTransitionFinished(this);
  }

  public loadResource(onResourceLoaded: () => void): void {
    const assets = this.createResourceList();

    if (assets.length <= 0) {
      onResourceLoaded();
      this.onResourceLoaded();
      return;
    }

    PIXI.loader.add(assets).load(
      (_: PIXI.loaders.Loader, resources: { [key: string]: PIXI.loaders.Resource }) => {
        if (this.hasSceneUiGraph) {
          const sceneUiGraphName = ResourceMaster.SceneUiGraph(this);
          this.applySceneUiGraph(resources[sceneUiGraphName].data);
        }

        onResourceLoaded();
        this.onResourceLoaded();
      }
    );
  }

  protected onResourceLoaded(): void {
  }

  protected createResourceList(): LoaderAddParam[] {
    if (this.hasSceneUiGraph) {
      const name = ResourceMaster.SceneUiGraph(this);
      return [
        { name: name, url:  name }
      ];
    }
    return [];
  }

  protected applySceneUiGraph(uiData: UI.Graph): void {
    for (let i = 0; i < uiData.nodes.length; i++) {
      const nodeData = uiData.nodes[i];

      let factory = UiGraph.getFactory(nodeData.type);
      if (!factory) {
        factory = this.getCustomUiGraphFactory(nodeData.type);
        if (!factory) {
          continue;
        }
      }

      const node = factory.createUiNodeByGraphElement(nodeData);
      if (!node) {
        continue;
      }

      if (nodeData.events) {
        factory.attachUiEventByGraphElement(nodeData.events, node, this);
      }

      this.uiGraph[nodeData.id] = node;
      this.uiGraphContainer.addChild(node);
    }
  }

  protected getCustomUiGraphFactory(_type: string): UiNodeFactory | null {
    return null;
  }
}

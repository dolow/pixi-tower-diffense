import UiGraphExampleResourceMaster from 'example/UiGraphExampleResourceMaster';
import * as UI from 'example/interfaces/UiGraph/index';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import UiGraph from 'example/UiGraph';
import UiNodeFactory from 'example/factory/UiNodeFactory';
import Scene from 'scenes/Scene';

/**
 * UI Graph を用いる抽象クラスのサンプル
 * UiGraph を利用して UI 情報を透過的に読み込み初期化する
 */
export default abstract class AbstractUiGraphScene extends Scene {
  /**
   * UiGraph でインスタンス化された PIXI.Container を含むオブジェクト
   */
  protected uiGraph: { [key: string]: PIXI.Container } = {};
  /**
   * UiGraph でロードされた UI データを配置するための PIXI.Container
   */
  protected uiGraphContainer: PIXI.Container = new PIXI.Container();

  /**
   * UI Graph 以外に利用するリソースがある場合に返す
   */
  protected createInitialResourceList(): string[] {
    return [];
  }

  /**
   * リソースロードを開始する
   */
  public beginLoadResource(onLoaded: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.loadInitialResource(() => resolve());
    }).then(() => {
      return new Promise((resolve) => {
        const additionalAssets = this.onInitialResourceLoaded();
        this.loadAdditionalResource(additionalAssets, () => resolve());
      });
    }).then(() => {
      this.onAdditionalResourceLoaded();
      onLoaded();
      this.onResourceLoaded();
    });
  }

  /**
   * UiGraph 情報と createInitialResourceList で指定されたリソースのロードを行う
   */
  protected loadInitialResource(onLoaded: () => void): void {
    const assets = this.createInitialResourceList();
    const name = UiGraphExampleResourceMaster.SceneUiGraph(this);
    assets.push(name);
    PIXI.loader.add(this.filterAssets(assets)).load(() => onLoaded());
  }

  /**
   * loadInitialResource 完了時のコールバックメソッド
   * 追加でロードしなければならないテクスチャなどの情報を返す
   */
  protected onInitialResourceLoaded(): string[] | LoaderAddParam[] {
    const additionalAssets = [];

    const name = UiGraphExampleResourceMaster.SceneUiGraph(this);
    const uiGraph = PIXI.loader.resources[name];
    for (let i = 0; i < uiGraph.data.nodes.length; i++) {
      const node = uiGraph.data.nodes[i];
      if (node.type === 'sprite') {
        additionalAssets.push({ name: node.params.textureName, url: node.params.url });
      }
    }

    return additionalAssets;
  }

  /**
   * onInitialResourceLoaded で発生した追加のリソースをロードする
   */
  protected loadAdditionalResource(assets: string[] | LoaderAddParam[], onLoaded: () => void) {
    PIXI.loader.add(this.filterAssets(assets)).load(() => onLoaded());
  }

  /**
   * 追加のリソースロード完了時のコールバック
   */
  protected onAdditionalResourceLoaded(): void {
    // 抽象クラスでは何もしない
  }

  /**
   * 全てのリソースロード処理完了時のコールバック
   */
  protected onResourceLoaded(): void {
    const sceneUiGraphName = UiGraphExampleResourceMaster.SceneUiGraph(this);
    this.prepareUiGraphContainer(PIXI.loader.resources[sceneUiGraphName].data);
    this.addChild(this.uiGraphContainer);

  }

  /**
   * UiGraph 要素を作成する
   */
  protected prepareUiGraphContainer(uiData: UI.Graph): void {
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

  /**
   * UiGraph にシーン独自の要素を指定する場合にこのメソッドを利用する
   */
  protected getCustomUiGraphFactory(_type: string): UiNodeFactory | null {
    // 抽象クラスでは何も持たない
    return null;
  }

  /**
   * 渡されたアセットのリストからロード済みのものをフィルタリングする
   */
  private filterAssets(assets: (LoaderAddParam | string)[]): LoaderAddParam[] {
    const assetMap = new Map<string, LoaderAddParam>();

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (typeof asset === 'string') {
        if (!PIXI.loader.resources[asset] && !assetMap.has(asset)) {
          assetMap.set(asset, { name: asset, url: asset });
        }
      } else {
        if (!PIXI.loader.resources[asset.name] && !assetMap.has(asset.name)) {
          assetMap.set(asset.name, asset);
        }
      }
    }

    return Array.from(assetMap.values());
  }
}

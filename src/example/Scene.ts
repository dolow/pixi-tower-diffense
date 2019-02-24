import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
import Transition from 'interfaces/Transition';
import Resource from 'example/Resource';
import UiGraph from 'example/UiGraph';
import UiNodeFactory from 'example/factory/UiNodeFactory';
import Immediate from 'example/transition/Immediate';
import UpdateObject from 'interfaces/UpdateObject';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';

/**
 * ゲームシーンの抽象クラス
 * UiGraph を利用して UI 情報を透過的に読み込み初期化する
 * また、シーン間のトランジションイベントを提供する
 * いずれのイベントも実装クラスにて独自処理の実装を行うことができる
 */
export default abstract class Scene extends PIXI.Container {
  /**
   * 更新すべきオブジェクトを保持する
   */
  protected objectsToUpdate: UpdateObject[] = [];

  /**
   * UiGraph でインスタンス化された PIXI.Container を含むオブジェクト
   */
  protected uiGraph: { [key: string]: PIXI.Container } = {};
  /**
   * UiGraph でロードされた UI データを配置するための PIXI.Container
   */
  protected uiGraphContainer: PIXI.Container = new PIXI.Container();

  /**
   * 経過フレーム数
   */
  protected elapsedFrameCount: number = 0;
  /**
   * シーン開始用のトランジションオブジェクト
   */
  protected transitionIn:  Transition = new Immediate();
  /**
   * シーン終了用のトランジションオブジェクト
   */
  protected transitionOut: Transition = new Immediate();

  /**
   * loadInitialResource に用いるリソースリストを作成するメソッド
   */
  protected createInitialResourceList(): (LoaderAddParam | string)[] {
    return [];
  }

  /**
   * リソースダウンロードのフローを実行する
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
   * 初回リソースのロードを行う
   */
  protected loadInitialResource(onLoaded: () => void): void {
    const assets = this.createInitialResourceList();
    const name = Resource.SceneUiGraph(this);
    assets.push(name);

    const filteredAssets = this.filterLoadedAssets(assets);

    if (filteredAssets.length > 0) {
      PIXI.loader.add(filteredAssets).load(() => onLoaded());
    } else {
      onLoaded();
    }
  }

  /**
   * loadInitialResource 完了時のコールバックメソッド
   * 追加でロードしなければならないテクスチャなどの情報を返す
   */
  protected onInitialResourceLoaded(): (string | LoaderAddParam)[] {
    const additionalAssets = [];

    const name = Resource.SceneUiGraph(this);
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
  protected loadAdditionalResource(assets: (string | LoaderAddParam)[], onLoaded: () => void) {
    PIXI.loader.add(this.filterLoadedAssets(assets)).load(() => onLoaded());
  }

  /**
   * 追加のリソースロード完了時のコールバック
   */
  protected onAdditionalResourceLoaded(): void {
    // 抽象クラスでは何もしない
  }

  /**
   * beginLoadResource 完了時のコールバックメソッド
   */
  protected onResourceLoaded(): void {
    const sceneUiGraphName = Resource.SceneUiGraph(this);
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
   * GameManager によって requestAnimationFrame 毎に呼び出されるメソッド
   */
  public update(delta: number): void {
    this.elapsedFrameCount++;

    this.updateRegisteredObjects(delta);

    if (this.transitionIn.isActive()) {
      this.transitionIn.update(delta);
    } else if (this.transitionOut.isActive()) {
      this.transitionOut.update(delta);
    }
  }

  /**
   * 更新処理を行うべきオブジェクトとして渡されたオブジェクトを登録する
   */
  protected registerUpdatingObject(object: UpdateObject): void {
    this.objectsToUpdate.push(object);
  }

  /**
   * 更新処理を行うべきオブジェクトを更新する
   */
  protected updateRegisteredObjects(delta: number): void {
    const nextObjectsToUpdate = [];

    for (let i = 0; i < this.objectsToUpdate.length; i++) {
      const obj = this.objectsToUpdate[i];
      if (!obj || obj.isDestroyed()) {
        continue;
      }
      obj.update(delta);
      nextObjectsToUpdate.push(obj);
    }

    this.objectsToUpdate = nextObjectsToUpdate;
  }

  /**
   * シーン追加トランジション開始
   * 引数でトランジション終了時のコールバックを指定できる
   */
  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void {
    this.transitionIn.setCallback(() => onTransitionFinished(this));

    const container = this.transitionIn.getContainer();
    if (container) {
      this.addChild(container);
    }

    this.transitionIn.begin();
  }

  /**
   * シーン削除トランジション開始
   * 引数でトランジション終了時のコールバックを指定できる
   */
  public beginTransitionOut(onTransitionFinished: (scene: Scene) => void): void {
    this.transitionOut.setCallback(() => onTransitionFinished(this));

    const container = this.transitionOut.getContainer();
    if (container) {
      this.addChild(container);
    }

    this.transitionOut.begin();
  }

  /**
   * 渡されたアセットのリストからロード済みのものをフィルタリングする
   */
  private filterLoadedAssets(assets: (LoaderAddParam | string)[]): LoaderAddParam[] {
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

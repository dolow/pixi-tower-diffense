import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import * as UI from 'interfaces/UiGraph/index';
import Transition from 'interfaces/Transition';
import UiGraph from 'modules/UiGraph';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import Immediate from 'scenes/transition/Immediate';

/**
 * ゲームシーンの抽象クラス
 * UiGraph を利用して UI 情報を透過的に読み込み初期化する
 * また、シーン間のトランジションイベントを提供する
 * いずれのイベントも実装クラスにて独自処理の実装が可能
 */
export default abstract class Scene extends PIXI.Container {
  /**
   * UiGraph を利用して読み込む UI があるかどうか
   */
  protected hasSceneUiGraph: boolean = true;
  /**
   * UiGraph でロードされた UI データ
   */
  protected uiGraph: { [key: string]: PIXI.Container } = {};
  /**
   * UiGraph でロードされた UI データを配置するための PIXI.Container
   * 描画順による前後関係を統制するために一つの Container にまとめる
   */
  protected uiGraphContainer: PIXI.Container = new PIXI.Container();

  protected objectsToUpdate: { update: (delta: number) => void }[] = [];

  protected transitionIn:  Transition = new Immediate();
  protected transitionOut: Transition = new Immediate();

  /**
   * GameManager によって requestAnimationFrame 毎に呼び出されるメソッド
   */
  public update(delta: number): void {
    this.updateRegisteredObjects(delta);

    if (this.transitionIn.isActive()) {
      this.transitionIn.update(delta);
    } else if (this.transitionOut.isActive()) {
      this.transitionOut.update(delta);
    }
  }

  protected registerUpdatingObject(object: { update: (delta: number) => void }): void {
    this.objectsToUpdate.push(object);
  }

  protected updateRegisteredObjects(delta: number): void {
    for (let i = 0; i < this.objectsToUpdate.length;) {
      const obj = this.objectsToUpdate[i];
      if (!obj) {
        this.objectsToUpdate = this.objectsToUpdate.splice(i, 1);
        continue
      }
      this.objectsToUpdate[i].update(delta);
      i++;
    }
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
   * loadResource に用いるリソースリストを作成するメソッド
   * デフォルトでは UiGraph のリソースリストを作成する
   */
  protected createResourceList(): LoaderAddParam[] {
    return [];
  }

  /**
   * リソースをロードする
   * デフォルトでは UiGraph 用の情報が取得される
   */
  public loadResource(onResourceLoaded: () => void): void {
    new Promise((resolve) => this.loadUiGraph(() => resolve()))
      .then(() => new Promise((resolve) => this.onUiGraphLoaded(() => resolve())))
      .then(() => onResourceLoaded())
      .then(() => this.onResourceLoaded());
  }

  protected loadUiGraph(onLoaded: () => void): void {
    const name = ResourceMaster.SceneUiGraph.Api(this);
    if (this.hasSceneUiGraph && !PIXI.loader.resources[name]) {
      PIXI.loader.add([{ name: name, url: name }]).load(() => onLoaded());
    } else {
      onLoaded();
    }
  }

  /**
   * loadResource 完了時のコールバックメソッド
   */
  protected onUiGraphLoaded(onLoaded: () => void): void {
    const assets = this.createResourceList();

    const name = ResourceMaster.SceneUiGraph.Api(this);
    const uiGraph = PIXI.loader.resources[name];
    if (uiGraph) {
      for (let i = 0; i < uiGraph.data.nodes.length; i++) {
        const node = uiGraph.data.nodes[i];
        if (node.type === 'sprite') {
          assets.push({ name: node.params.textureName, url: node.params.url });
        }
      }
    }

    if (assets.length <= 0) {
      onLoaded();
    } else {
      const newAssets = [];
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (!PIXI.loader.resources[asset.name]) {
          newAssets.push(asset);
        }
      }
      if (newAssets.length > 0) {
        PIXI.loader.add(newAssets).load(() => onLoaded());
      } else {
        onLoaded();
      }
    }
  }


  /**
   * loadResource 完了時のコールバックメソッド
   */
  protected onResourceLoaded(): void {
    if (this.hasSceneUiGraph) {
      const sceneUiGraphName = ResourceMaster.SceneUiGraph.Api(this);
      this.prepareUiGraphContainer(PIXI.loader.resources[sceneUiGraphName].data);
      this.addChild(this.uiGraphContainer);
    }
  }

  /**
   * UiGraph 用の PIXI.Container インスタンスに UiGraph 要素をロードする
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
   * UiGraph にシーン独自の要素を追加する場合にこのメソッドを利用する
   */
  protected getCustomUiGraphFactory(_type: string): UiNodeFactory | null {
    return null;
  }
}

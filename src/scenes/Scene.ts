import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import * as UI from 'interfaces/UiGraph/index';
import UiGraph from 'modules/UiGraph';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';

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

  /**
   * GameManager によって requestAnimationFrame 毎に呼び出されるメソッド
   */
  public update(delta: number): void {
    this.updateRegisteredObjects(delta);
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
    onTransitionFinished(this);
  }

  /**
   * シーン削除トランジション開始
   * 引数でトランジション終了時のコールバックを指定できる
   */
  public beginTransitionOut(onTransitionFinished: (scene: Scene) => void): void {
    onTransitionFinished(this);
  }

  /**
   * loadResource に用いるリソースリストを作成するメソッド
   * デフォルトでは UiGraph のリソースリストを作成する
   */
  protected createResourceList(): LoaderAddParam[] {
    if (this.hasSceneUiGraph) {
      const name = ResourceMaster.SceneUiGraph.Api(this);
      return [
        { name: name, url:  name }
      ];
    }
    return [];
  }

  /**
   * リソースをロードする
   * デフォルトでは UiGraph 用の情報が取得される
   */
  public loadResource(onResourceLoaded: () => void): void {
    const assets = this.createResourceList();
    const pixiLoaderOnLoaded = () => {
      onResourceLoaded();
      this.onResourceLoaded();
    };

    if (assets.length <= 0) {
      pixiLoaderOnLoaded();
    } else {
      const newAssets = [];
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (!PIXI.loader.resources[asset.name]) {
          newAssets.push(asset);
        }
      }
      PIXI.loader.add(newAssets).load(pixiLoaderOnLoaded);
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

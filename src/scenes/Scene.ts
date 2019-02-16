import * as PIXI from 'pixi.js';
import Resource from 'Resource';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import * as UI from 'interfaces/UiGraph/index';
import Transition from 'interfaces/Transition';
import SoundManager from 'managers/SoundManager';
import UiGraph from 'modules/UiGraph';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UpdateObject from 'interfaces/UpdateObject';
import Immediate from 'scenes/transition/Immediate';

/**
 * ゲームシーンの抽象クラス
 * UiGraph を利用して UI 情報を透過的に読み込み初期化する
 * また、シーン間のトランジションイベントを提供する
 * いずれのイベントも実装クラスにて独自処理の実装を行うことができる
 */
export default abstract class Scene extends PIXI.Container {
  /**
   * 経過フレーム数
   */
  protected elapsedFrameCount: number = 0;
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
  /**
   * 更新すべきオブジェクトを保持する
   */
  protected objectsToUpdate: UpdateObject[] = [];

  /**
   * シーン開始用のトランジションオブジェクト
   */
  protected transitionIn:  Transition = new Immediate();
  /**
   * シーン終了用のトランジションオブジェクト
   */
  protected transitionOut: Transition = new Immediate();

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
    // 破棄されたオブジェクトを圧縮するために残存するオブジェクトのみを保持する
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
  public beginTransitionOut(
    onTransitionFinished: (scene: Scene) => void
  ): void {
    this.transitionOut.setCallback(() => onTransitionFinished(this));

    const container = this.transitionOut.getContainer();
    if (container) {
      this.addChild(container);
    }

    this.transitionOut.begin();
  }

  /**
   * loadInitialResource に用いるリソースリストを作成するメソッド
   * デフォルトでは UiGraph のリソースリストを作成する
   */
  protected createInitialResourceList(): (LoaderAddParam | string)[] {
    return [];
  }

  /**
   * リソースダウンロードのフローを実行する
   * デフォルトでは UiGraph 用の情報が取得される
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
      onLoaded();
    }).then(() => {
      this.onResourceLoaded();
    });
  }

  /**
   * リソースダウンロードのフローを実行する
   * UiGraph 情報も含まれる
   */
  protected loadInitialResource(onLoaded: () => void): void {
    const assets = this.createInitialResourceList();
    const name = Resource.Api.SceneUiGraph(this);
    if (this.hasSceneUiGraph && !PIXI.loader.resources[name]) {
      assets.push({ name, url: name });
    }

    const filteredAssets = this.filterLoadedAssets(assets);

    if (filteredAssets.length > 0) {
      PIXI.loader.add(filteredAssets).load(() => onLoaded());
    } else {
      onLoaded();
    }
  }

  /**
   * loadInitialResource 完了時のコールバックメソッド
   */
  protected onInitialResourceLoaded(): (LoaderAddParam | string)[] {
    const additionalAssets = [];

    const name = Resource.Api.SceneUiGraph(this);
    const uiGraph = PIXI.loader.resources[name];
    if (uiGraph) {
      for (let i = 0; i < uiGraph.data.nodes.length; i++) {
        const node = uiGraph.data.nodes[i];
        if (node.type === 'sprite') {
          additionalAssets.push({
            name: node.params.textureName,
            url: node.params.url
          });
        }
      }
    }

    return additionalAssets;
  }

  /**
   * 初回リソースロードで発生した追加のリソースをロードする
   */
  protected loadAdditionalResource(
    assets: (LoaderAddParam | string)[], onLoaded: () => void
  ) {
    if (assets.length <= 0) {
      this.onAdditionalResourceLoaded(onLoaded);
      return;
    }

    const filteredAssets = this.filterLoadedAssets(assets);

    if (filteredAssets.length > 0) {
      PIXI.loader.add(filteredAssets).load(() => {
        this.onAdditionalResourceLoaded(onLoaded);
      });
    } else {
      this.onAdditionalResourceLoaded(onLoaded);
    }
  }

  /**
   * 追加のリソースロード完了時のコールバック
   */
  protected onAdditionalResourceLoaded(onLoaded: () => void): void {
    onLoaded();
  }

  /**
   * beginLoadResource 完了時のコールバックメソッド
   */
  protected onResourceLoaded(): void {
    if (this.hasSceneUiGraph) {
      const sceneUiGraphName = Resource.Api.SceneUiGraph(this);
      const resources = PIXI.loader.resources;
      this.prepareUiGraphContainer(resources[sceneUiGraphName].data);
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

  /**
   * 渡されたアセットのリストからロード済みのものをフィルタリングする
   */
  private filterLoadedAssets(
    assets: (LoaderAddParam | string)[]
  ): LoaderAddParam[] {
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

  /**
   * BGM をループ再生する
   */
  protected playBgm(soundName: string): void {
    const bgm = SoundManager.getSound(soundName);
    if (bgm) {
      bgm.play(true);
    }
  }

  /**
   * BGM 再生を止める
   */
  protected stopBgm(soundName: string): void {
    const bgm = SoundManager.getSound(soundName);
    if (bgm) {
      bgm.stop();
    }
  }

  /**
   * 効果音を再生する
   */
  protected playSe(soundName: string): void {
    const se = SoundManager.getSound(soundName);
    if (se) {
      se.play();
    }
  }
}

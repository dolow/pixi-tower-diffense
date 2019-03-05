import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';
import Immediate from 'example/transition/Immediate';
import UpdateObject from 'interfaces/UpdateObject';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';

/**
 * ゲームシーンの抽象クラス
 * シーン間のトランジションイベントを提供する
 * いずれのイベントも実装クラスにて独自処理の実装を行うことができる
 */
export default abstract class Scene extends PIXI.Container {
  /**
   * 更新すべきオブジェクトを保持する
   */
  protected objectsToUpdate: UpdateObject[] = [];

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
    return [];
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

    const loaderParams: LoaderAddParam[] = [];
    assetMap.forEach((value: LoaderAddParam) => loaderParams.push(value));
    return loaderParams;
  }
}

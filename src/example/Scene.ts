import * as PIXI from 'pixi.js';
import Transition from 'interfaces/Transition';
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
      onLoaded();
    }).then(() => {
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
  protected registerUpdatingObject(_object: UpdateObject): void {
  }

  /**
   * 更新処理を行うべきオブジェクトを更新する
   */
  protected updateRegisteredObjects(_delta: number): void {
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

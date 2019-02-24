import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
import Transition from 'interfaces/Transition';
import UiNodeFactory from 'example/factory/UiNodeFactory';
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
    protected objectsToUpdate: UpdateObject[];
    /**
     * UiGraph でインスタンス化された PIXI.Container を含むオブジェクト
     */
    protected uiGraph: {
        [key: string]: PIXI.Container;
    };
    /**
     * UiGraph でロードされた UI データを配置するための PIXI.Container
     */
    protected uiGraphContainer: PIXI.Container;
    /**
     * 経過フレーム数
     */
    protected elapsedFrameCount: number;
    /**
     * シーン開始用のトランジションオブジェクト
     */
    protected transitionIn: Transition;
    /**
     * シーン終了用のトランジションオブジェクト
     */
    protected transitionOut: Transition;
    /**
     * loadInitialResource に用いるリソースリストを作成するメソッド
     */
    protected createInitialResourceList(): (LoaderAddParam | string)[];
    /**
     * リソースダウンロードのフローを実行する
     */
    beginLoadResource(onLoaded: () => void): Promise<void>;
    /**
     * 初回リソースのロードを行う
     */
    protected loadInitialResource(onLoaded: () => void): void;
    /**
     * loadInitialResource 完了時のコールバックメソッド
     * 追加でロードしなければならないテクスチャなどの情報を返す
     */
    protected onInitialResourceLoaded(): (string | LoaderAddParam)[];
    /**
     * onInitialResourceLoaded で発生した追加のリソースをロードする
     */
    protected loadAdditionalResource(assets: (string | LoaderAddParam)[], onLoaded: () => void): void;
    /**
     * 追加のリソースロード完了時のコールバック
     */
    protected onAdditionalResourceLoaded(): void;
    /**
     * beginLoadResource 完了時のコールバックメソッド
     */
    protected onResourceLoaded(): void;
    /**
     * UiGraph 要素を作成する
     */
    protected prepareUiGraphContainer(uiData: UI.Graph): void;
    /**
     * UiGraph にシーン独自の要素を指定する場合にこのメソッドを利用する
     */
    protected getCustomUiGraphFactory(_type: string): UiNodeFactory | null;
    /**
     * GameManager によって requestAnimationFrame 毎に呼び出されるメソッド
     */
    update(delta: number): void;
    /**
     * 更新処理を行うべきオブジェクトとして渡されたオブジェクトを登録する
     */
    protected registerUpdatingObject(object: UpdateObject): void;
    /**
     * 更新処理を行うべきオブジェクトを更新する
     */
    protected updateRegisteredObjects(delta: number): void;
    /**
     * シーン追加トランジション開始
     * 引数でトランジション終了時のコールバックを指定できる
     */
    beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void;
    /**
     * シーン削除トランジション開始
     * 引数でトランジション終了時のコールバックを指定できる
     */
    beginTransitionOut(onTransitionFinished: (scene: Scene) => void): void;
    /**
     * 渡されたアセットのリストからロード済みのものをフィルタリングする
     */
    private filterLoadedAssets;
}

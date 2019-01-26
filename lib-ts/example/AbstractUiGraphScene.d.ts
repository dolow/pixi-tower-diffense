/// <reference types="pixi.js" />
import * as UI from 'example/interfaces/UiGraph/index';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
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
    protected uiGraph: {
        [key: string]: PIXI.Container;
    };
    /**
     * UiGraph でロードされた UI データを配置するための PIXI.Container
     */
    protected uiGraphContainer: PIXI.Container;
    /**
     * UI Graph 以外に利用するリソースがある場合に返す
     */
    protected createInitialResourceList(): string[];
    /**
     * リソースロードを開始する
     */
    beginLoadResource(onLoaded: () => void): Promise<void>;
    /**
     * UiGraph 情報と createInitialResourceList で指定されたリソースのロードを行う
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
     * 全てのリソースロード処理完了時のコールバック
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
     * 渡されたアセットのリストからロード済みのものをフィルタリングする
     */
    private filterAssets;
}

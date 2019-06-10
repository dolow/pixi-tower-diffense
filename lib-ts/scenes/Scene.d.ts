import * as PIXI from 'pixi.js';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import * as UI from 'interfaces/UiGraph/index';
import Transition from 'interfaces/Transition';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UpdateObject from 'interfaces/UpdateObject';
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
    protected elapsedFrameCount: number;
    /**
     * UiGraph を利用して読み込む UI があるかどうか
     */
    protected hasSceneUiGraph: boolean;
    /**
     * UiGraph でロードされた UI データ
     */
    protected uiGraph: {
        [key: string]: PIXI.Container;
    };
    /**
     * UiGraph でロードされた UI データを配置するための PIXI.Container
     * 描画順による前後関係を統制するために一つの Container にまとめる
     */
    protected uiGraphContainer: PIXI.Container;
    /**
     * 更新すべきオブジェクトを保持する
     */
    protected objectsToUpdate: UpdateObject[];
    /**
     * シーン開始用のトランジションオブジェクト
     */
    protected transitionIn: Transition;
    /**
     * シーン終了用のトランジションオブジェクト
     */
    protected transitionOut: Transition;
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
     * loadInitialResource に用いるリソースリストを作成するメソッド
     * デフォルトでは UiGraph のリソースリストを作成する
     */
    protected createInitialResourceList(): (LoaderAddParam | string)[];
    /**
     * リソースダウンロードのフローを実行する
     * デフォルトでは UiGraph 用の情報が取得される
     */
    beginLoadResource(onLoaded: () => void): Promise<void>;
    /**
     * リソースダウンロードのフローを実行する
     * UiGraph 情報も含まれる
     */
    protected loadInitialResource(onLoaded: () => void): void;
    /**
     * loadInitialResource 完了時のコールバックメソッド
     */
    protected onInitialResourceLoaded(): (LoaderAddParam | string)[];
    /**
     * 初回リソースロードで発生した追加のリソースをロードする
     */
    protected loadAdditionalResource(assets: (LoaderAddParam | string)[], onLoaded: () => void): void;
    /**
     * 追加のリソースロード完了時のコールバック
     */
    protected onAdditionalResourceLoaded(onLoaded: () => void): void;
    /**
     * beginLoadResource 完了時のコールバックメソッド
     */
    protected onResourceLoaded(): void;
    /**
     * UiGraph 用の PIXI.Container インスタンスに UiGraph 要素をロードする
     */
    protected prepareUiGraphContainer(uiData: UI.Graph): void;
    /**
     * UiGraph にシーン独自の要素を追加する場合にこのメソッドを利用する
     */
    protected getCustomUiGraphFactory(_type: string): UiNodeFactory | null;
    /**
     * 渡されたアセットのリストからロード済みのものをフィルタリングする
     */
    private filterLoadedAssets;
    /**
     * BGM をループ再生する
     */
    protected playBgm(soundName: string): void;
    /**
     * BGM 再生を止める
     */
    protected stopBgm(soundName: string): void;
    /**
     * 効果音を再生する
     */
    protected playSe(soundName: string): void;
}

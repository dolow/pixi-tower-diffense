import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import UiNodeFactory from 'example/factory/UiNodeFactory';
/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class OrderScene extends Scene {
    /**
     * 独自 UiGraph 要素のファクトリを返す
     * このシーンでは UnitButton をカスタム UI 要素として持っている
     */
    protected getCustomUiGraphFactory(type: string): UiNodeFactory | null;
    /**
     * リソースがロードされた時のコールバック
     */
    protected onInitialResourceLoaded(): (LoaderAddParam | string)[];
    /**
     * リソースロード完了後に実行されるコールバック
     * UnitButton の初期化を行う
     */
    protected onResourceLoaded(): void;
    /**
     * UI 情報として定義されたイベントコールバックメソッド
     */
    onStageArrowTapped(...args: any[]): void;
    onUnitArrowTapped(...args: any[]): void;
    onOkButtonDown(...args: any[]): void;
    onOkButtonUp(...args: any[]): void;
}

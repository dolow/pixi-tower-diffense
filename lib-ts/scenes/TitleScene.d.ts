import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
/**
 * タイトルシーン
 */
export default class TitleScene extends Scene {
    constructor();
    /**
     * リソースリストを作成し返却する
     */
    protected createResourceList(): LoaderAddParam[];
    /**
     * リソースがロードされた時のコールバック
     */
    protected onResourceLoaded(): void;
    /**
     * ゲーム開始ボタン押下が離されたされたときのコールバック
     */
    startBattle(): void;
}

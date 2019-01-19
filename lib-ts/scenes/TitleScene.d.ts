import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
/**
 * タイトルシーン
 */
export default class TitleScene extends Scene {
    constructor();
    protected createResourceList(): LoaderAddParam[];
    protected onResourceLoaded(): void;
    /**
     * ゲーム開始ボタン押下が離されたされたときのコールバック
     */
    startBattle(): void;
}

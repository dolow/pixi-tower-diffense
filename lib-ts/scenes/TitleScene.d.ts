import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
/**
 * タイトルシーン
 */
export default class TitleScene extends Scene {
    private static titleBgmKey;
    constructor();
    protected createResourceList(): LoaderAddParam[];
    protected onResourceLoaded(): void;
    /**
     * ゲーム開始ボタンが押下されたときのコールバック
     */
    onGameStartTappedDown(): void;
    /**
     * ゲーム開始ボタン押下が離されたされたときのコールバック
     */
    onGameStartTappedUp(): void;
}

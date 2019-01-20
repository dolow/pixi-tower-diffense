import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
/**
 * タイトルシーン
 */
export default class TitleScene extends Scene {
    /**
     * TOUCH TO START テキストの明滅感覚
     */
    private readonly textAppealDuration;
    /**
     * コンストラクタ
     */
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
     * 毎フレームの更新処理
     */
    update(dt: number): void;
    /**
     * 編成ボタンが離されたときのコールバック
     */
    startOrder(): void;
}

import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
/**
 * タイトルシーン
 */
export default class TitleScene extends Scene {
    /**
     * テキストを明滅させる間隔
     */
    private readonly textAppealDuration;
    /**
     * TOUCH TI START のテキスト
     */
    private text;
    /**
     * コンストラクタ
     */
    constructor();
    /**
     * リソースリストを作成し返却する
     */
    protected createInitialResourceList(): (LoaderAddParam | string)[];
    /**
     * リソースがロードされた時のコールバック
     */
    protected onResourceLoaded(): void;
    update(dt: number): void;
    /**
     * 編成ボタンが離されたときのコールバック
     */
    showOrderScene(): void;
}

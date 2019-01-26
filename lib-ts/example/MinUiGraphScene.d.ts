import Scene from 'scenes/Scene';
/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class MinUiGraphScene extends Scene {
    /**
     * UI 情報が定義された json ファイル URL
     */
    private readonly jsonUrl;
    /**
     * json ファイルをパースしたオブジェクト
     */
    private json;
    /**
     * json ファイルを元に作られた UI系インスタンスのオブジェクト
     */
    private ui;
    /**
     * UI 情報が定義された json をダウンロードする
     * GameManager によって初期化時にコールされる
     * 本来は Scene で透過的に UI 情報を取得するが、サンプルとして明示的に処理する
     */
    beginLoadResource(onLoaded: () => void): Promise<void>;
    /**
     * json がダウンロードされたら PIXI.Container 派生インスタンスを画面に追加する
     * また、スプライトに必要なテクスチャをダウンロードする
     */
    private onJsonLoaded;
    /**
     * Sprite に必要なテクスチャの URL を集める
     */
    private collectTextureUrls;
    /**
     * テクスチャがダウンロードされたら割り当てる
     */
    private onTexturesLoaded;
    /**
     * 要素の種類ごとに初期化メソッドを実行する
     * 本実装ではここの処理はカプセル化しており、ここではサンプルとして明示的に処理している
     */
    private addUiContainers;
    /**
     * PIXI.Sprite インスタンスを作成して addChild する
     */
    private createSprite;
    /**
     * PIXI.Text インスタンスを作成して addChild する
     */
    private createText;
    /**
     * イベント処理を設定する
     */
    private attachEvents;
    /**
     * UI 情報として定義されたイベントコールバックメソッド
     */
    onStageArrowTapped(...args: any[]): void;
    onUnitArrowTapped(...args: any[]): void;
    onOkButtonDown(...args: any[]): void;
    onOkButtonUp(...args: any[]): void;
}

import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import UiNodeFactory from 'example/factory/UiNodeFactory';
/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class OrderScene extends Scene {
    /**
     * ユーザのバトル情報
     */
    private userBattle;
    /**
     * ユニットマスターのキャッシュ
     */
    private unitMasterCache;
    /**
     * ユニットIDと紐つけたユニットパネル用のテクスチャマップ
     */
    private unitButtonTexturesCache;
    /**
     * ユニット枠IDと紐つけたユニットパネル用のマップ
     */
    private unitButtons;
    /**
     * 選択中のステージID
     */
    private currentStageId;
    /**
     * 前回編成したユニットID配列
     */
    private lastUnitIds;
    /**
     * コンストラクタ
     */
    constructor();
    /**
     * 独自 UiGraph 要素のファクトリを返す
     * このシーンでは UnitButton をカスタム UI 要素として持っている
     */
    protected getCustomUiGraphFactory(type: string): UiNodeFactory | null;
    /**
     * リソースリストを作成し返却する
     */
    protected createInitialResourceList(): (LoaderAddParam | string)[];
    /**
     * リソースをロードする
     * 基本実装をオーバーライドし、 indexed db のレコードを取得する
     */
    beginLoadResource(onLoaded: () => void): Promise<void>;
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
    onStageArrowTapped(addValue: number): void;
    onUnitArrowTapped(slotIndex: number, addValue: number): void;
    onOkButtonDown(): void;
    onOkButtonUp(): void;
    /**
     * UnitButton を初期化する
     */
    private initUnitButtons;
    /**
     * 必要であれば BGM を再生する
     */
    private playBgmIfNeeded;
    /**
     * 選択されているステージ ID を更新する
     */
    private updateCurrentStageId;
    /**
     * 可能であればバトル画面に遷移する
     */
    private startBattleIfPossible;
    /**
     * バトル用のパラメータを作成する
     */
    private createBattleParameter;
    /**
     * BGM をフェードアウトする
     */
    private fadeOutBgm;
    /**
     * DB へユニットID配列を保存する
     */
    private saveUnitIdsToDB;
    /**
     * DB からユニットID配列を取得する
     */
    private loadUnitIdsFromDB;
    /**
     * DB へステージIDを保存する
     */
    private saveStageIdToDB;
    /**
     * DB からステージIDを取得する
     */
    private loadStageIdFromDB;
}

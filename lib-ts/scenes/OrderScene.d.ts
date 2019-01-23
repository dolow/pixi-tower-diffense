import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import Scene from 'scenes/Scene';
/**
 * 編成シーン
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
     * 追加リソースダウンロード完了時コールバック
     */
    protected onResourceLoaded(): void;
    /**
     * ユニットの切り替えボタンが押下された時のコールバック
     */
    onUnitArrowTapped(slotIndex: number, addValue: number): void;
    /**
     * ステージの切り替えボタンが押下された時のコールバック
     */
    onStageArrowTapped(addValue: number): void;
    /**
     * OK ボタンが押下されたされたときのコールバック
     */
    onOkButtonDown(): void;
    /**
     * OK ボタン押下が離されたされたときのコールバック
     */
    onOkButtonUp(): void;
    /**
     * 独自 UiGraph 要素のファクトリを返す
     * OrderScene は BattleScene と UnitButton を共用している
     */
    protected getCustomUiGraphFactory(type: string): UiNodeFactory | null;
    /**
     * 可能であればバトル画面に遷移する
     */
    private startBattleIfPossible;
    /**
     * UnitButton を初期化する
     */
    private initUnitButtons;
    /**
     * 選択されているステージ ID を更新する
     */
    private updateCurrentStageId;
    /**
     * バトル用のパラメータを作成する
     */
    private createBattleParameter;
    /**
     * 必要であれば BGM を再生する
     */
    private playBgmIfNeeded;
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
    /**
     * BGM をフェードアウトする
     */
    private fadeOutBgm;
}

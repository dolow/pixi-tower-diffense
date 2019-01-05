import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import Unit from 'display/battle/Unit';
/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleManager に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleManagerDelegate {
    /**
     * 最大ユニット編成数
     */
    private maxUnitSlotCount;
    /**
     * 利用するフィールドID
     */
    private fieldId;
    /**
     * 挑戦するステージID
     */
    private stageId;
    /**
     * 編成したユニットID配列
     */
    private unitIds;
    /**
     * このシーンのステート
     */
    private state;
    /**
     * ゲームロジックを処理する BattleManager のインスタンス
     */
    private manager;
    /**
     * 背景の PIXI.Container
     */
    private field;
    private destroyList;
    /**
     * 拠点の座標
     */
    private basePos;
    /**
     * GameMasterDelegate 実装
     * Unit が発生したときのコールバック
     * Field に Unit のスプライトを追加する
     */
    onUnitsSpawned(units: Unit[]): void;
    /**
     * ユニットのステートが変更した際のコールバック
     */
    onUnitStateChanged(unit: Unit, _oldState: number): void;
    /**
     * GameMasterDelegate 実装
     * Unit が更新されたときのコールバック
     * Unit のアニメーションと PIXI による描画を更新する
     */
    onUnitUpdated(unit: Unit): void;
    /**
     * GameMasterDelegate 実装
     * 利用可能なコストの値が変動したときのコールバック
     */
    onAvailableCostUpdated(cost: number): void;
    /**
     * GameMasterDelegate 実装
     * 渡されたユニット同士が接敵可能か返す
     */
    shouldLock(attacker: Unit, target: Unit): boolean;
    /**
     * GameMasterDelegate 実装
     * 渡されたユニット同士が攻撃可能か返す
     */
    shouldDamage(attacker: Unit, target: Unit): boolean;
    shouldWalk(unit: Unit): boolean;
    constructor();
    /**
     * リソースリストの作成
     * ユーザが選択したユニットとフィールドのリソース情報も加える
     */
    protected createResourceList(): LoaderAddParam[];
    /**
     * リソースロード完了コールバック
     * BattleManager にユニットマスタ情報を私、フィールドやユニットボタンの初期化を行う
     */
    protected onResourceLoaded(): void;
    /**
     * 独自 UiGraph 要素のファクトリを返す
     * BattleScene は UnitButton を独自で定義している
     */
    protected getCustomUiGraphFactory(type: string): UiNodeFactory | null;
    /**
     * 毎フレームの更新処理
     * シーンのステートに応じて処理する
     */
    update(delta: number): void;
    /**
     * UnitButton 用のコールバック
     * タップされたボタンに応じたユニットの生成を BattleManager にリクエストする
     */
    onUnitButtonTapped(buttonIndex: number): void;
    /**
     * ボタンインデックスから UnitButton インスタンスを返す
     */
    private getUiGraphUnitButton;
}

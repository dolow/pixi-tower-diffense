import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import AttackableEntity from 'entity/AttackableEntity';
import BaseEntity from 'entity/BaseEntity';
import UnitEntity from 'entity/UnitEntity';
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
     * 指定された拠点ID
     */
    private baseIdMap;
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
     * GameManagerDelegate 実装
     * Base を発生させるときのコールバック
     * Field に Base のスプライトを追加する
     */
    spawnBaseEntity(baseId: number, isPlayer: boolean): BaseEntity | null;
    /**
     * GameManagerDelegate 実装
     * Unit を発生させるときのコールバック
     * Field に Unit のスプライトを追加する
     */
    spawnUnitEntity(unitId: number, baseEntity: BaseEntity, isPlayer: boolean): UnitEntity | null;
    /**
     * ユニットのステートが変更した際のコールバック
     */
    onUnitStateChanged(entity: UnitEntity, _oldState: number): void;
    /**
     * GameManagerDelegate 実装
     * Base が更新されたときのコールバック
     * Base のアニメーションと PIXI による描画を更新する
     */
    onBaseUpdated(base: BaseEntity): void;
    /**
     * GameManagerDelegate 実装
     * Unit が更新されたときのコールバック
     * Unit のアニメーションと PIXI による描画を更新する
     */
    onUnitUpdated(entity: UnitEntity): void;
    /**
     * GameManagerDelegate 実装
     * 利用可能なコストの値が変動したときのコールバック
     */
    onAvailableCostUpdated(cost: number): void;
    /**
     * GameManagerDelegate 実装
     * 渡されたユニット同士が接敵可能か返す
     */
    shouldLockUnit(attacker: AttackableEntity, target: UnitEntity): boolean;
    shouldLockBase(attacker: AttackableEntity, target: BaseEntity): boolean;
    /**
     * GameManagerDelegate 実装
     * 渡されたユニット同士が攻撃可能か返す
     */
    shouldDamage(attackerEntity: AttackableEntity, targetEntity: AttackableEntity): boolean;
    shouldUnitWalk(entity: UnitEntity): boolean;
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

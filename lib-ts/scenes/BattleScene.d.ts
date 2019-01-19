import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import BattleParameter from 'interfaces/BattleParameter';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import AttackableEntity from 'entity/AttackableEntity';
import BaseEntity from 'entity/BaseEntity';
import UnitEntity from 'entity/UnitEntity';
/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleLogic に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleLogicDelegate {
    /**
     * マスターデータを保存する PIXI.loaders.resource のキー
     */
    private static readonly MasterResourceKey;
    /**
     * このシーンのステート
     */
    private state;
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
     * 編成した拠点パラメータ
     */
    private playerBaseParams;
    /**
     * 編成したユニットID配列
     */
    private unitIds;
    /**
     * 指定された拠点ID
     */
    private baseIdMap;
    /**
     * ゲームロジックを処理する BattleLogic のインスタンス
     */
    private manager;
    /**
     * 背景の PIXI.Container
     */
    private field;
    /**
     * Field に最後にユニットを追加した Zline のインデックス
     * ユニットが重なって表示されるのを防ぐ
     */
    private fieldLastAddedZline;
    /**
     * コンストラクタ
     */
    constructor(params: BattleParameter);
    /**
     * Scene クラスメソッドオーバーライド
     */
    /**
     * トランジション開始処理
     * トランジション終了で可能ならステートを変更する
     */
    beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void;
    /**
     * 毎フレームの更新処理
     * シーンのステートに応じて処理する
     */
    update(delta: number): void;
    /**
     * リソースリストの作成
     * ユーザが選択したユニットとフィールドのリソース情報も加える
     */
    protected createResourceList(): LoaderAddParam[];
    /**
     * リソースロード完了コールバック
     * BattleLogic にユニットマスタ情報を私、フィールドやユニットボタンの初期化を行う
     */
    protected onResourceLoaded(): void;
    /**
     * 独自 UiGraph 要素のファクトリを返す
     * BattleScene は UnitButton を独自で定義している
     */
    protected getCustomUiGraphFactory(type: string): UiNodeFactory | null;
    /**
     * BattleLogicDelegate 実装
     */
    /**
     * Base を発生させるときのコールバック
     * Field に Base のスプライトを追加する
     */
    spawnBaseEntity(baseId: number, isPlayer: boolean): BaseEntity | null;
    /**
     * Unit を発生させるときのコールバック
     * Field に Unit のスプライトを追加する
     */
    spawnUnitEntity(unitId: number, baseEntity: BaseEntity, isPlayer: boolean): UnitEntity | null;
    /**
     * エンティティのステートが変更された際のコールバック
     */
    onAttackableEntityStateChanged(entity: AttackableEntity, _oldState: number): void;
    /**
     * 利用可能なコストの値が変動したときのコールバック
     */
    onAvailableCostUpdated(cost: number): void;
    /**
     * 勝敗が決定したときのコールバック
     */
    onGameOver(isPlayerWon: boolean): void;
    /**
     * 渡されたエンティティ同士が接敵可能か返す
     */
    shouldLockAttackableEntity(attacker: AttackableEntity, target: AttackableEntity): boolean;
    /**
     * 渡されたエンティティ同士が攻撃可能か返す
     */
    shouldDamage(attackerEntity: AttackableEntity, targetEntity: AttackableEntity): boolean;
    /**
     * 渡されたエンティティの health が増減した場合に呼ばれる
     */
    onAttackableEntityHealthUpdated(_attacker: AttackableEntity, target: AttackableEntity, fromHealth: number, toHealth: number, maxHealth: number): void;
    /**
    * 渡されたユニットが移動すべきかどうかを返す
     */
    shouldUnitWalk(entity: UnitEntity): boolean;
    /**
     * 特異メソッド
     */
    /**
     * UnitButton 用のコールバック
     * タップされたボタンに応じたユニットの生成を BattleLogic にリクエストする
     */
    onUnitButtonTapped(buttonIndex: number): void;
    /**
     * ボタンインデックスから UnitButton インスタンスを返す
     */
    private getUiGraphUnitButton;
    private enableBackToTitle;
    private backToTitle;
}

import BattleParameter from 'example/BattleParameter';
import BattleLogicDelegate from 'example/BattleLogicDelegate';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'example/Scene';
import AttackableEntity from 'example/AttackableEntity';
import CastleEntity from 'example/CastleEntity';
import UnitEntity from 'example/UnitEntity';
import UiNodeFactory from 'example/factory/UiNodeFactory';
/**
 * メインのゲーム部分のシーン
 * ゲームロジックは BattleLogic に委譲し、主に描画周りを行う
 */
export default class BattleScene extends Scene implements BattleLogicDelegate {
    /**
     * ステージの長さに対する拠点座標のオフセット
     */
    private static readonly castleXOffset;
    /**
     * UI Graph ユニットボタンのキープリフィックス
     */
    private static readonly unitButtonPrefix;
    /**
     * このシーンのステート
     */
    private state;
    /**
     * 編成したユニットID配列
     */
    private unitIds;
    /**
     * 編成した拠点パラメータ
     */
    private playerCastle;
    /**
     * 編成したユニットID配列
     */
    private stageId;
    /**
     * ユニット編成数
     */
    private unitSlotCount;
    /**
     * ゲームロジックを処理する BattleLogic のインスタンス
     */
    private battleLogic;
    /**
     * BattleLogic 用の設定
     */
    private battleLogicConfig;
    /**
     * ユニットアニメーションマスターのキャッシュ
     */
    private unitAnimationMasterCache;
    /**
     * Field インスタンス
     */
    private field;
    /**
     * エンティティの ID で紐付けられた有効な Unit インスタンスのマップ
     */
    private attackables;
    /**
     * ユニットボタンをグルーピングする PIXI.Container
     */
    private unitButtonContainers;
    /**
     * コンストラクタ
     */
    constructor(params: BattleParameter);
    /**
     * Scene クラスメソッドオーバーライド
     */
    protected createInitialResourceList(): (string | LoaderAddParam)[];
    /**
     * リソースロード完了コールバック
     * BattleLogic にユニットマスタ情報を渡し、フィールドやユニットボタンの初期化を行う
     */
    protected onInitialResourceLoaded(): (LoaderAddParam | string)[];
    /**
     * リソースロード完了時のコールバック
     */
    protected onResourceLoaded(): void;
    /**
     * トランジション開始処理
     * トランジション終了で可能ならステートを変更する
     */
    beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void;
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
     * 勝敗が決定したときのコールバック
     */
    onGameOver(isPlayerWon: boolean): void;
    /**
     * CastleEntity が生成されたときのコールバック
     */
    onCastleEntitySpawned(entity: CastleEntity, isPlayer: boolean): void;
    /**
     * UnitEntity が生成されたときのコールバック
     * id に紐つけて表示物を生成する
     */
    onUnitEntitySpawned(entity: UnitEntity): void;
    /**
     * 利用可能なコストの値が変動したときのコールバック
     */
    onAvailableCostUpdated(cost: number, maxCost: number, availablePlayerUnitIds: number[]): void;
    /**
     * エンティティのステートが変更された際のコールバック
     */
    onAttackableEntityStateChanged(entity: AttackableEntity, _oldState: number): void;
    /**
     * 渡された UnitEntity の distance が変化した時に呼ばれる
     */
    onAttackableEntityWalked(entity: AttackableEntity): void;
    /**
     * 渡された UnitEntity がノックバック中に呼ばれる
     */
    onAttackableEntityKnockingBack(entity: AttackableEntity, _knockBackRate: number): void;
    /**
     * 渡されたエンティティの health が増減した場合に呼ばれる
     */
    onAttackableEntityHealthUpdated(_attacker: AttackableEntity, _target: AttackableEntity, _fromHealth: number, _toHealth: number, _maxHealth: number): void;
    /**
     * 渡されたエンティティ同士が攻撃可能か返す
     */
    shouldDamage(attackerEntity: AttackableEntity, targetEntity: AttackableEntity): boolean;
    /**
     * 渡されたユニットが移動すべきかどうかを返す
     */
    shouldAttackableWalk(entity: AttackableEntity): boolean;
    /**
     * 渡されたエンティティ同士が接敵可能か返す
     */
    shouldEngageAttackableEntity(attacker: AttackableEntity, target: AttackableEntity): boolean;
    /**
     * UnitButton 用のコールバック
     * タップされたボタンに応じたユニットの生成を BattleLogic にリクエストする
     */
    onUnitButtonTapped(buttonIndex: number): void;
    /**
     * ボタンインデックスから UnitButton インスタンスを返す
     */
    private getUiGraphUnitButton;
    /**
     * ユニットボタンの初期化
     */
    private initUnitButtons;
    /**
     * 編成画面へ戻る
     */
    private backToOrderScene;
    /**
     * サウンドの初期化
     */
    private initSound;
    private toggleUnitButtonFilter;
}

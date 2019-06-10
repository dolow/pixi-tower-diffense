import BattleLogicDelegate from 'example/BattleLogicDelegate';
import BattleLogicConfig from 'example/BattleLogicConfig';
import UnitMaster from 'example/UnitMaster';
import CastleMaster from 'example/CastleMaster';
import StageMaster from 'example/StageMaster';
/**
 * ゲーム内バトルパートのマネージャ
 * ゲームロジックを中心に扱う
 */
export default class BattleLogic {
    /**
     * バトル設定
     */
    private config;
    /**
     * BattleLogicDelegate 実装オブジェクト
     */
    private delegator;
    /**
     * 現在の利用可能なコスト
     */
    private availableCost;
    /**
     * 次に割り当てるエンティティID
     */
    private nextEntityId;
    /**
     * 生成済みの Unit インスタンスを保持する配列
     */
    private attackableEntities;
    /**
     * UnitMaster をキャッシュするための Map
     */
    private unitMasterCache;
    /**
     * CastleMaster をキャッシュするための Map
     */
    private castleMasterCache;
    /**
     * フィールドマスタのキャッシュ
     */
    private stageMasterCache;
    /**
     * StageMaster.waves をキャッシュするための Map
     */
    private aiWaveCache;
    /**
     * 勝敗が決まっているかどうか
     */
    private isGameOver;
    /**
     * 経過フレーム数
     */
    private passedFrameCount;
    /**
     * 外部から生成をリクエストされたユニット情報を保持する配列
     */
    private spawnRequestedUnitUnitIds;
    /**
     * プレイヤー情報
     */
    private player?;
    /**
     * デリゲータとマスタ情報で初期化
     */
    init(params: {
        delegator: BattleLogicDelegate;
        stageMaster: StageMaster;
        unitMasters: UnitMaster[];
        player: {
            unitIds: number[];
            castle: CastleMaster;
        };
        ai: {
            castle: CastleMaster;
        };
        config?: BattleLogicConfig;
    }): void;
    /**
     * ゲーム更新処理
     * 外部から任意のタイミングでコールする
     */
    update(): void;
    /**
     * Unit 生成をリクエストする
     */
    requestSpawn(unitId: number, isPlayer: boolean): void;
    /**
     * Unit 生成をリクエストする
     * プレイヤーユニット生成リクエストのシュガー
     */
    requestSpawnPlayer(unitId: number): void;
    /**
     * Unit 生成をリクエストする
     * AIユニット生成リクエストのシュガー
     */
    requestSpawnAI(unitId: number): void;
    /**
     * バトル状況からゲーム終了かどうかを判断する
     */
    private updateGameOver;
    /**
     * 利用可能なコストを更新し、専用のコールバックをコールする
     */
    private updateAvailableCost;
    /**
     * 現在のフレームに応じて AI ユニットを生成させる
     */
    private updateAISpawn;
    /**
     * 受け付けた Unit 生成リクエストを処理する
     * プレイヤーユニットの場合はコストを消費し、Unit 生成を試みる
     */
    private updateSpawnRequest;
    /**
     * Unit のパラメータを更新する
     * ステートは全てのパラメータが変化した後に更新する
     */
    private updateEntityParameter;
    /**
     * ダメージ判定を行い、必要に応じて以下を更新する。
     * - currentHealth
     * - currentFrameDamage
     */
    private updateDamage;
    /**
     * 移動可能か判定し、必要なら以下を更新する。
     * - distance
     * - currentKnockBackFrameCount
     */
    private updateDistance;
    /**
     * エンティティのステートを更新する
     * ステート優先順位は右記の通り DEAD > KNOCK_BACK > ENGAGED > IDLE
     * ユニット毎に処理を行うとステートを条件にした処理結果が
     * タイミングによって異なってしまうのでステート毎に処理を行う
     */
    private updateEntityState;
    /**
     * ノックバック時のステート更新処理
     */
    private updateAttackableKnockBackState;
    /**
     * 接敵時のステート更新処理
     */
    private updateAttackableEngagedState;
    /**
     * 何もしていない状態でのステート更新処理
     */
    private updateAttackableIdleState;
    /**
     * メインループ後処理
     */
    private updatePostProcess;
    private spawnCastle;
}

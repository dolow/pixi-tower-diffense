import FieldMaster from 'interfaces/master/FieldMaster';
import AIWaveMaster from 'interfaces/master/AIWaveMaster';
import UnitMaster from 'interfaces/master/UnitMaster';
import BaseMaster from 'interfaces/master/BaseMaster';
import BattleLogicDelegate from 'interfaces/BattleLogicDelegate';
import UnitEntity from 'entity/UnitEntity';
/**
 * ゲーム内バトルパートのマネージャ
 * ゲームロジックを中心に扱う
 */
export default class BattleLogic {
    /**
     * フレームごとのコスト回復量
     */
    costRecoveryPerFrame: number;
    /**
     * 利用可能コストの上限値
     */
    maxAvailableCost: number;
    /**
     * BattleLogicDelegate 実装オブジェクト
     */
    private delegator;
    /**
     * 現在の利用可能なコスト
     */
    private availableCost;
    /**
     * 次に割り当てるユニットID
     */
    private nextUnitId;
    /**
     * 生成済みの Unit インスタンスを保持する配列
     */
    private unitEntities;
    /**
     * 生成済みの Base インスタンスを保持する配列
     */
    private baseEntities;
    /**
     * フィールドマスタのキャッシュ
     */
    private fieldMasterCache;
    getFieldMaster(): FieldMaster | null;
    /**
     * AIWaveMaster をキャッシュするための Map
     */
    private aiWaveMasterCache;
    /**
     * UnitMaster をキャッシュするための Map
     */
    private unitMasterCache;
    getUnitMaster(unitId: number): UnitMaster | null;
    /**
     * BaseMaster をキャッシュするための Map
     */
    private baseMasterCache;
    /**
     * 外部から生成をリクエストされたユニット情報を保持する配列
     */
    private spawnRequestedUnitUnitIds;
    /**
     * 経過フレーム数
     */
    private passedFrameCount;
    /**
     * 勝敗が決まっているかどうか
     */
    private isGameOver;
    /**
     * デリゲータとマスタ情報で初期化
     */
    init(params: {
        delegator: BattleLogicDelegate;
        aiWaveMaster: AIWaveMaster;
        fieldMaster: FieldMaster;
        unitMasters: UnitMaster[];
        baseMasterMap: {
            player: BaseMaster;
            ai: BaseMaster;
        };
    }): void;
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
     * 渡された Unit が、ロジック上死亡扱いであるかどうかを返す
     */
    isDied(unit: UnitEntity): boolean;
    /**
     * ゲーム更新処理
     * 外部から任意のタイミングでコールする
     */
    update(_delta: number): void;
    /**
     * Unit のパラメータを更新する
     * ステートは全てのパラメータが変化した後に更新する
     */
    private updateEntityParameter;
    /**
     * エンティティのステートを更新する
     * ステート優先順位は右記の通り DEAD > LOCKED > IDLE
     * ユニット毎に処理を行うとステートを条件にした処理結果が
     * タイミングによって異なってしまうのでステート毎に処理を行う
     */
    private updateEntityState;
    /**
     * ダメージ判定を行い、必要なら health を上限させる
     */
    private updateDamage;
    /**
     * 移動可能か判定し、可能なら移動させる
     */
    private updateDistance;
    /**
     * 死亡時のステート更新処理
     */
    private updateUnitDeadState;
    /**
     * 接敵時のステート更新処理
     */
    private updateUnitLockedState;
    /**
     * 何もしていない状態でのステート更新処理
     */
    private updateUnitIdleState;
    /**
     * バトル状況かたゲーム終了かどうかを判断する
     */
    private updateGameOver;
    /**
     * 必要であれば AI ユニットを生成させる
     */
    private requestAISpawn;
    /**
     * 受け付けた Unit 生成リクエストを処理する
     * プレイヤーユニットの場合はコストを消費し、Unit 生成を試みる
     * コストが足りなければ何もしない
     */
    private updateSpawnRequest;
    /**
     * 利用可能なコストを更新し、専用のコールバックをコールする
     */
    private updateAvailableCost;
}

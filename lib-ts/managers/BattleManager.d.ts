import AIWaveMaster from 'interfaces/master/AIWave';
import UnitMaster from 'interfaces/master/Unit';
import BattleManagerDelegate from 'interfaces/BattleManagerDelegate';
import UnitEntity from 'entity/UnitEntity';
import Unit from 'display/battle/Unit';
/**
 * ゲーム内バトルパートのマネージャ
 * ゲームロジックを中心に扱う
 * TODO: Although GameManager is singleton, BattleManager is expected to be used by creating instance.
 * So class name should be changed.
 */
export default class BattleManager {
    /**
     * フレームごとのコスト回復量
     */
    costRecoveryPerFrame: number;
    /**
     * 利用可能コストの上限値
     */
    maxAvailableCost: number;
    /**
     * BattleManagerDelegate 実装オブジェクト
     */
    private delegator;
    /**
     * 現在の利用可能なコスト
     */
    private availableCost;
    /**
     * 生成済みの Unit インスタンスを保持する配列
     */
    private units;
    /**
     * AIWaveMaster をキャッシュするための Map
     */
    private aiWaveMasterCache;
    /**
     * UnitMaster をキャッシュするための Map
     */
    private unitMasterCache;
    /**
     * 外部から生成をリクエストされたユニット情報を保持する配列
     */
    private spawnRequestedUnitUnitIds;
    /**
     * 経過フレーム数
     */
    private passedFrameCount;
    init(aiWaveMaster: AIWaveMaster, unitMaster: UnitMaster[], delegator?: BattleManagerDelegate): void;
    setDelegator(delegator: BattleManagerDelegate): void;
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
     * コストを消費し、Unit 生成を試みる
     * コストが足りなければ何もしない
     */
    trySpawn(unitId: number, isPlayer: boolean): Unit | null;
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
     * Unit のステートを更新する
     * ステート優先順位は右記の通り DEAD > LOCKED > IDLE
     */
    private updateState;
    private updateParameter;
    private updateDamage;
    private updateDeadState;
    private updateLockedState;
    private updateIdleState;
    private requestAISpawn;
    /**
     * 受け付けた Unit 生成リクエストを処理する
     */
    private updateSpawnRequest;
    /**
     * 利用可能なコストを更新し、専用のコールバックをコールする
     */
    private refreshAvailableCost;
}

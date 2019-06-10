import Attackable from 'example/Attackable';
import UnitAnimationMaster from 'interfaces/master/UnitAnimationMaster';
/**
 * ユニットの振舞い、及び見た目に関する処理を行う
 * UnitEntity を継承する
 */
export default class Unit extends Attackable {
    /**
     * アニメーション情報
     */
    protected animationMaster: UnitAnimationMaster;
    /**
     * 現在のアニメーションフレーム
     */
    protected animationFrameId: number;
    /**
     * 再生をリクエストされたアニメーション種別
     */
    protected requestedAnimationType: string | null;
    /**
     * コンストラクタ
     */
    constructor(animationMaster: UnitAnimationMaster, spawnPosition: {
        x: number;
        y: number;
    });
    /**
     * アニメーション再生をリセットする
     */
    resetAnimation(): void;
    /**
     * 人師種別のアニメーションの再生をリクエストする
     * リクエストされたアニメーションは再生可能になり次第再生される
     */
    requestAnimation(type: string): void;
    /**
     * 現在のアニメーションフレームのインデックスが当たり判定の発生するインデックスかどうかを返す
     */
    isHitFrame(): boolean;
    /**
     * UpdateObject インターフェース実装
     * requestAnimationFrame 毎のアップデート処理
     */
    update(_dt: number): void;
    updateAnimation(): void;
    isAnimationLastFrameTime(): boolean;
    /**
     * アニメーション遷移が可能であれば遷移する
     */
    private transformAnimationIfPossible;
}

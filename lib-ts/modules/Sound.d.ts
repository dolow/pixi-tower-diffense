/**
 * サウンド処理を行うクラス
 */
export default class Sound {
    /**
     * ボリュームのセッタ
     */
    /**
    * ボリュームのゲッタ
    */
    volume: number;
    /**
     * サウンド再生時間を返す
     */
    readonly elapsedTime: number;
    /**
     * paused の public ゲッタ
     */
    isPaused(): boolean;
    /**
     * GainNode インスタンス
     */
    gainNode: GainNode;
    /**
     * ループ再生フラグ
     */
    loop: boolean;
    /**
     * AudioBuffer インスタンス
     */
    private buffer;
    /**
     * AudioBufferSourceNode インスタンス
     */
    private source;
    /**
     * 再生開始フラグ
     */
    private played;
    /**
     * 一時停止フラグ
     */
    private paused;
    /**
     * サウンド再生開始時間オフセット
     */
    private offset;
    /**
     * AudioContext インスタンスの currentTime を基準に保持する再生開始時間
     */
    private playedAt;
    /**
     * コンストラクタ
     * AudioBuffer はユーザ側で用意する
     */
    constructor(buf: AudioBuffer);
    /**
     * 再生開始
     */
    play(loop?: boolean, offset?: number): void;
    /**
     * 停止
     */
    stop(): void;
    /**
     * 一時停止
     */
    pause(): void;
    /**
     * 再開
     */
    resume(): void;
}

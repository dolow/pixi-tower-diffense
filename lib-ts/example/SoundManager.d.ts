import { BrowserInfo, BotInfo, NodeInfo } from 'detect-browser';
/**
 * サウンドを扱う
 * Sound の高級機能
 */
export default class SoundManager {
    /**
     * シングルトンインスタンス
     */
    static instance: SoundManager;
    /**
     * AudioCntext インスタンスのゲッタ
     * ブラウザによっては生成数に上限があるため、SoundManager では単一のインスタンスのみ生成する
     */
    static readonly sharedContext: AudioContext | null;
    /**
     * SoundManager がサポートするサウンドファイル拡張子
     */
    private static readonly supportedExtensions;
    /**
     * AudioCntext インスタンス
     */
    private static context;
    /**
     * WebAudio 利用の初期化済みフラグ
     */
    private static webAudioInitialized;
    /**
     * コンストラクタ
     */
    constructor();
    /**
     * 初期化処理
     * ユーザで生成した AudioContext を渡すこともできる
     */
    static init(ctx?: AudioContext): void;
    /**
     * サウンドを初期化するためのイベントを登録する
     * 多くのブラウザではタップ等のユーザ操作を行わないとサウンドを再生できない
     * そのため、初回画面タップ時にダミーの音声を再生させて以降のサウンド再生処理を許容できるようにする
     */
    static setSoundInitializeEvent(browser: BrowserInfo | BotInfo | NodeInfo): void;
    /**
     * オーディオデータをパースするための PIXI.Loader ミドルウェアを登録する
     */
    static useWebAudio(browser: BrowserInfo | BotInfo | NodeInfo): void;
    /**
     * オーディオデータのデコード処理
     */
    static decodeAudio(binary: any, callback: (buf: AudioBuffer) => void): void;
    /**
     * オーディオデータのデコード処理
     * ブラウザ種別やバージョンによっては I/F が異なるため、こちらを使う必要がある
     */
    static decodeAudioWithPromise(binary: any, callback: (buf: AudioBuffer) => void): void;
}

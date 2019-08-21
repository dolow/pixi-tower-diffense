import { BrowserInfo, BotInfo, NodeInfo } from 'detect-browser';
import Sound from 'modules/Sound';
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
     * AudioCntext インスタンス
     */
    private static context;
    /**
     * WebAudio 利用の初期化済みフラグ
     */
    private static webAudioInitialized;
    /**
     * SoundManager がサポートするサウンドファイル拡張子
     */
    private static readonly supportedExtensions;
    /**
     * 一時停止中かどうかのフラグ
     */
    private paused;
    /**
     * フェード処理後に削除する Sound インスタンスのリスト
     */
    private killingSounds;
    /**
     * SoundManager で監理している Sound インスタンスの Map
     */
    private managedSounds;
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
     * 毎フレームの更新処理
     */
    static update(_delta: number): void;
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
    /**
     * サウンドを初期化するためのイベントを登録する
     * 多くのブラウザではタップ等のユーザ操作を行わないとサウンドを再生できない
     * そのため、初回画面タップ時にダミーの音声を再生させて以降のサウンド再生処理を許容できるようにする
     */
    static setSoundInitializeEvent(browser: BrowserInfo | BotInfo | NodeInfo): void;
    /**
     * HTML window のライフサイクルイベントを登録する
     * ブラウザのタブ切り替えや非アクティヴ時に音声が鳴ってしまわないようにする
     */
    static setWindowLifeCycleEvent(browser: BrowserInfo | BotInfo | NodeInfo): void;
    /**
     * 渡された Sound インスタンスを渡された名前に紐つけて SoundManager 管理下にする
     */
    static registerSound(name: string, sound: Sound): void;
    /**
     * 渡された名前に紐ついている Sound インスタンスを SoundManager 管理下からはずす
     */
    static unregisterSound(name: string): void;
    /**
     * Sound インスタンスを SoundManager 管理下として生成し返却する
     */
    static createSound(name: string, buf: AudioBuffer): Sound;
    /**
     * 渡された名前に紐付く SoundManager 管理下の Sound インスタンスを返す
     */
    static getSound(name: string): Sound | undefined;
    /**
     * 渡された名前に紐付く SoundManager 管理下の Sound インスタンスの存在有無を返す
     */
    static hasSound(name: string): boolean;
    /**
     * 渡された名前に紐付く SoundManager 管理下の Sound インスタンスを破棄する
     */
    static destroySound(name: string): void;
    /**
     * 管理下の Sound インスタンスをすべて一時停止する
     */
    static pause(): void;
    /**
     * 管理下の Sound インスタンスの再生をすべて再開する
     */
    static resume(): void;
    /**
     * フェード処理を行う
     */
    static fade(sound: Sound, targetVolume: number, seconds: number, stopOnEnd?: boolean): void;
}

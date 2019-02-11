import { detect, BrowserInfo, BotInfo, NodeInfo } from 'detect-browser';
import Sound from 'modules/Sound';

/**
 * サウンドを扱う
 * Sound の高級機能
 */
export default class SoundManager {
  /**
   * シングルトンインスタンス
   */
  public static instance: SoundManager;

  /**
   * AudioCntext インスタンスのゲッタ
   * ブラウザによっては生成数に上限があるため、SoundManager では単一のインスタンスのみ生成する
   */
  public static get sharedContext(): AudioContext | null {
    return SoundManager.context;
  }

  /**
   * AudioCntext インスタンス
   */
  private static context: AudioContext | null = null;

  /**
   * WebAudio 利用の初期化済みフラグ
   */
  private static webAudioInitialized: boolean = false;

  /**
   * SoundManager がサポートするサウンドファイル拡張子
   */
  private static readonly supportedExtensions = ['mp3'];

  /**
   * 一時停止中かどうかのフラグ
   */
  private paused: boolean = false;

  /**
   * フェード処理後に削除する Sound インスタンスのリスト
   */
  private killingSounds: { sound: Sound, endAt: number }[] = [];

  /**
   * SoundManager で監理している Sound インスタンスの Map
   */
  private managedSounds: Map<string, Sound> = new Map();

  /**
   * コンストラクタ
   */
  constructor() {
    if (SoundManager.instance) {
      throw new Error('SoundManager can not be initialized twice');
    }
  }

  /**
   * 初期化処理
   * ユーザで生成した AudioContext を渡すこともできる
   */
  public static init(ctx?: AudioContext): void {
    if (SoundManager.instance) {
      return;
    }

    SoundManager.instance = new SoundManager();

    if (ctx) {
      SoundManager.context = ctx;
    } else {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      SoundManager.context = new AudioContextClass();
    }

    const browser = detect();
    if (!browser) {
      return;
    }

    SoundManager.useWebAudio(browser);
    SoundManager.setSoundInitializeEvent(browser);
    SoundManager.setWindowLifeCycleEvent(browser);
  }

  /**
   * 毎フレームの更新処理
   */
  public static update(_delta: number): void {
    if (!SoundManager.sharedContext) {
      return;
    }

    // 削除予定のサウンドがあれば削除する
    const killingSounds = SoundManager.instance.killingSounds;
    if (killingSounds.length > 0) {
      const remainedSounds = [];

      for (let i = 0; i < killingSounds.length; i++) {
        const item = killingSounds[i];
        if (SoundManager.sharedContext.currentTime >= item.endAt) {
          item.sound.stop();
        } else {
          remainedSounds.push(item);
        }
      }

      SoundManager.instance.killingSounds = remainedSounds;
    }
  }

  /**
   * オーディオデータをパースするための PIXI.Loader ミドルウェアを登録する
   */
  public static useWebAudio(browser: BrowserInfo | BotInfo | NodeInfo): void {
    if (SoundManager.webAudioInitialized) {
      return;
    }

    const supportedExtensions = SoundManager.supportedExtensions;

    // xhr でバイナリ取得する拡張子を登録
    for (let i = 0; i < supportedExtensions.length; i++) {
      const extension = supportedExtensions[i];
      const PixiResource = PIXI.loaders.Loader.Resource;
      PixiResource.setExtensionXhrType(
        extension,
        PixiResource.XHR_RESPONSE_TYPE.BUFFER
      );
      PixiResource.setExtensionLoadType(
        extension,
        PixiResource.LOAD_TYPE.XHR
      );
    }

    // Chrome の一部バージョンでサウンドのデコード方法が異なるためメソッドを変える
    const majorVersion = (browser.version)
      ? browser.version.split('.')[0]
      : '0';
    let methodName = 'decodeAudio';
    if (browser.name === 'chrome' && Number.parseInt(majorVersion, 10) === 64) {
      methodName = 'decodeAudioWithPromise';
    }

    // resource-loader ミドルウェアの登録
    PIXI.loader.use((resource: any, next: Function) =>  {
      const extension = resource.url.split('?')[0].split('.')[1];
      if (extension && supportedExtensions.indexOf(extension) !== -1) {
        // リソースオブジェクトに buffer という名前でプロパティを生やす
        (SoundManager as any)[methodName](resource.data, (buf: AudioBuffer) => {
          resource.buffer = buf;
          next();
        });
      } else {
        next();
      }
    });

    SoundManager.webAudioInitialized = true;
  }

  /**
   * オーディオデータのデコード処理
   */
  public static decodeAudio(
    binary: any,
    callback: (buf: AudioBuffer) => void
  ): void {
    if (SoundManager.sharedContext) {
      SoundManager.sharedContext.decodeAudioData(binary, callback);
    }
  }
  /**
   * オーディオデータのデコード処理
   * ブラウザ種別やバージョンによっては I/F が異なるため、こちらを使う必要がある
   */
  public static decodeAudioWithPromise(
    binary: any,
    callback: (buf: AudioBuffer) => void
  ): void {
    if (SoundManager.sharedContext) {
      SoundManager.sharedContext.decodeAudioData(binary).then(callback);
    }
  }

  /**
   * サウンドを初期化するためのイベントを登録する
   * 多くのブラウザではタップ等のユーザ操作を行わないとサウンドを再生できない
   * そのため、初回画面タップ時にダミーの音声を再生させて以降のサウンド再生処理を許容できるようにする
   */
  public static setSoundInitializeEvent(
    browser: BrowserInfo | BotInfo | NodeInfo
  ): void {
    const type = typeof document.ontouchend;
    const eventName = (type === 'undefined') ? 'mousedown' : 'touchend';
    let soundInitializer: () => void;

    const majorVersion = (browser.version)
      ? browser.version.split('.')[0]
      : '0';

    if (browser.name === 'chrome' && Number.parseInt(majorVersion, 10) >= 66) {
      soundInitializer = () => {
        if (SoundManager.sharedContext) {
          SoundManager.sharedContext.resume();
        }
        document.body.removeEventListener(eventName, soundInitializer);
      };
    } else if (browser.name === 'safari') {
      soundInitializer = () => {
        const context = SoundManager.sharedContext;
        if (context) {
          const silentSource = context.createBufferSource();
          silentSource.buffer = context.createBuffer(1, 1, 44100);
          silentSource.connect(context.destination);
          silentSource.start(0);
          silentSource.disconnect();
        }

        document.body.removeEventListener(eventName, soundInitializer);
      };
    } else {
      return;
    }

    document.body.addEventListener(eventName, soundInitializer);
  }

  /**
   * HTML window のライフサイクルイベントを登録する
   * ブラウザのタブ切り替えや非アクティヴ時に音声が鳴ってしまわないようにする
   */
  public static setWindowLifeCycleEvent(
    browser: BrowserInfo | BotInfo | NodeInfo
  ): void {
    if (browser.name === 'safari') {
      document.addEventListener('webkitvisibilitychange', () => {
        (document as any).webkitHidden
          ? SoundManager.pause()
          : SoundManager.resume();
      });
    } else {
      document.addEventListener('visibilitychange', () => {
        document.hidden ? SoundManager.pause() : SoundManager.resume();
      });
    }
  }

  /**
   * 渡された Sound インスタンスを渡された名前に紐つけて SoundManager 管理下にする
   */
  public static registerSound(name: string, sound: Sound): void {
    SoundManager.instance.managedSounds.set(name, sound);
  }
  /**
   * 渡された名前に紐ついている Sound インスタンスを SoundManager 管理下からはずす
   */
  public static unregisterSound(name: string): void {
    SoundManager.instance.managedSounds.delete(name);
  }
  /**
   * Sound インスタンスを SoundManager 管理下として生成し返却する
   */
  public static createSound(name: string, buf: AudioBuffer): Sound {
    const sound = new Sound(buf);
    SoundManager.registerSound(name, sound);
    return sound;
  }
  /**
   * 渡された名前に紐付く SoundManager 管理下の Sound インスタンスを返す
   */
  public static getSound(name: string): Sound | undefined {
    return SoundManager.instance.managedSounds.get(name);
  }
  /**
   * 渡された名前に紐付く SoundManager 管理下の Sound インスタンスの存在有無を返す
   */
  public static hasSound(name: string): boolean {
    return SoundManager.instance.managedSounds.has(name);
  }
  /**
   * 渡された名前に紐付く SoundManager 管理下の Sound インスタンスを破棄する
   */
  public static destroySound(name: string): void {
    const sound = this.getSound(name);
    SoundManager.unregisterSound(name);
    if (sound) {
      sound.stop();
    }
  }

  /**
   * 管理下の Sound インスタンスをすべて一時停止する
   */
  public static pause(): void {
    const instance = SoundManager.instance;
    if (instance.paused) {
      return;
    }
    instance.paused = true;
    instance.managedSounds.forEach((sound) => { sound.pause(); });
  }
  /**
   * 管理下の Sound インスタンスの再生をすべて再開する
   */
  public static resume(): void {
    const instance = SoundManager.instance;
    if (!instance.paused) {
      return;
    }
    instance.paused = false;
    instance.managedSounds.forEach((sound) => { sound.resume(); });
  }

  /**
   * フェード処理を行う
   */
  public static fade(
    sound: Sound,
    targetVolume: number,
    seconds: number,
    stopOnEnd: boolean = false
  ): void {
    if (!SoundManager.sharedContext) {
      return;
    }

    const endAt = SoundManager.sharedContext.currentTime + seconds;

    sound.gainNode.gain.exponentialRampToValueAtTime(targetVolume, endAt);
    if (stopOnEnd) {
      SoundManager.instance.killingSounds.push({ sound, endAt });
    }
  }
}

import { detect, BrowserInfo, BotInfo, NodeInfo } from 'detect-browser';

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
   * SoundManager がサポートするサウンドファイル拡張子
   */
  private static readonly supportedExtensions = ['mp3'];

  /**
   * AudioCntext インスタンス
   */
  private static context: AudioContext | null = null;

  /**
   * WebAudio 利用の初期化済みフラグ
   */
  private static webAudioInitialized: boolean = false;

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
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      SoundManager.context = new AudioContextClass();
    }

    const browser = detect();
    if (!browser) {
      return;
    }

    SoundManager.useWebAudio(browser);
    SoundManager.setSoundInitializeEvent(browser);
  }

  /**
   * サウンドを初期化するためのイベントを登録する
   * 多くのブラウザではタップ等のユーザ操作を行わないとサウンドを再生できない
   * そのため、初回画面タップ時にダミーの音声を再生させて以降のサウンド再生処理を許容できるようにする
   */
  public static setSoundInitializeEvent(browser: BrowserInfo | BotInfo | NodeInfo): void {
    const eventName = (document.ontouchend === undefined) ? 'mousedown' : 'touchend';
    let soundInitializer: () => void;

    const majorVersion = (browser.version) ? browser.version.split('.')[0] : '0';

    if (browser.name === 'chrome' && Number.parseInt(majorVersion, 10) >= 66) {
      soundInitializer = () => {
        if (SoundManager.sharedContext) {
          SoundManager.sharedContext.resume();
        }
        document.body.removeEventListener(eventName, soundInitializer);
      };
    } else if (browser.name === 'safari') {
      soundInitializer = () => {
        if (SoundManager.sharedContext) {
          const silentSource = SoundManager.sharedContext.createBufferSource();
          silentSource.buffer = SoundManager.sharedContext.createBuffer(1, 1, 44100);
          silentSource.connect(SoundManager.sharedContext.destination);
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
      PixiResource.setExtensionXhrType(extension, PixiResource.XHR_RESPONSE_TYPE.BUFFER);
      PixiResource.setExtensionLoadType(extension, PixiResource.LOAD_TYPE.XHR);
    }

    // Chrome の一部バージョンでサウンドのデコード方法が異なるためメソッドを変える
    const majorVersion = (browser.version) ? browser.version.split('.')[0] : '0';
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
  public static decodeAudio(binary: any, callback: (buf: AudioBuffer) => void): void {
    if (SoundManager.sharedContext) {
      SoundManager.sharedContext.decodeAudioData(binary, callback);
    }
  }
  /**
   * オーディオデータのデコード処理
   * ブラウザ種別やバージョンによっては I/F が異なるため、こちらを使う必要がある
   */
  public static decodeAudioWithPromise(binary: any, callback: (buf: AudioBuffer) => void): void {
    if (SoundManager.sharedContext) {
      SoundManager.sharedContext.decodeAudioData(binary).then(callback);
    }
  }
}

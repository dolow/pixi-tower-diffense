import { detect, BrowserInfo, BotInfo, NodeInfo } from 'detect-browser';
import Sound from 'modules/Sound';

const SUPPORTED_EXTENSIONS = ['mp3'];

export default class SoundManager {
  public static instance: SoundManager;

  public static get sharedContext(): AudioContext | null {
    return SoundManager.context;
  }

  private static context: AudioContext | null = null;

  private static loaderMiddlewareAdded: boolean = false;

  private paused: boolean = false;

  private soundsKillingAfterFade: { sound: Sound, targetVolume: number }[] = [];

  private managedSounds: Map<string, Sound> = new Map();

  constructor() {
    if (SoundManager.instance) {
      throw new Error('soSoundManager can not be initialized twice');
    }
  }

  public static init(ctx?: AudioContext): void {
    if (SoundManager.instance) {
      return;
    }

    SoundManager.instance = new SoundManager();

    SoundManager.context = (ctx) ? ctx : new ((window as any).AudioContext || (window as any).webkitAudioContext)();

    const browser = detect();
    if (!browser) {
      return;
    }

    SoundManager.addLoaderMiddleware(browser);
    SoundManager.setSoundInitializeEvent(browser);
    SoundManager.setWindowLifeCycleEvent(browser);
  }

  public static addLoaderMiddleware(browser: BrowserInfo | BotInfo | NodeInfo): void {
    if (SoundManager.loaderMiddlewareAdded) {
      return;
    }

    for (let i = 0; i < SUPPORTED_EXTENSIONS.length; i++) {
      const extension = SUPPORTED_EXTENSIONS[i];
      const Resource = PIXI.loaders.Loader.Resource;
      Resource.setExtensionXhrType(extension, Resource.XHR_RESPONSE_TYPE.BUFFER);
      Resource.setExtensionLoadType(extension, Resource.LOAD_TYPE.XHR);
    }

    const majorVersion = (browser.version) ? browser.version.split('.')[0] : '0';

    let methodName = 'decodeAudio';
    if (browser.name === 'chrome' && Number.parseInt(majorVersion) === 64) {
      methodName = 'decodeAudioWithPromise';
    }

    PIXI.loader.use((resource: any, next: Function) =>  {
      const extension = resource.url.split('?')[0].split('.')[1];
      if (extension && SUPPORTED_EXTENSIONS.indexOf(extension) !== -1) {
        (SoundManager as any)[methodName](resource.data, (buf: AudioBuffer) => {
          resource.buffer = buf;
          next();
        });
      } else {
        next();
      }
    });

    SoundManager.loaderMiddlewareAdded = true;
  }

  public static decodeAudio(binary: any, callback: (buf: AudioBuffer) => void): void {
    if (SoundManager.sharedContext) {
      SoundManager.sharedContext.decodeAudioData(binary, callback);
    }
  }
  public static decodeAudioWithPromise(binary: any, callback: (buf: AudioBuffer) => void): void {
    if (SoundManager.sharedContext) {
      SoundManager.sharedContext.decodeAudioData(binary).then(callback);
    }
  }

  public static setSoundInitializeEvent(browser: BrowserInfo | BotInfo | NodeInfo): void {
    let eventName = (typeof document.ontouchend === 'undefined') ? 'mousedown' : 'touchend';
    let soundInitializer: () => void;

    const majorVersion = (browser.version) ? browser.version.split('.')[0] : '0';

    if (browser.name === 'chrome' && Number.parseInt(majorVersion) >= 66) {
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

  public static setWindowLifeCycleEvent(browser: BrowserInfo | BotInfo | NodeInfo): void {
    if (browser.name === 'safari') {
      document.addEventListener('webkitvisibilitychange', () => {
        (document as any).webkitHidden ? SoundManager.instance.pause() : SoundManager.instance.resume();
      });
    } else {
      document.addEventListener('visibilitychange', () => {
        document.hidden ? SoundManager.instance.pause() : SoundManager.instance.resume();
      });
    }
  }

  public registerSound(name: string, sound: Sound): void {
    this.managedSounds.set(name, sound);
  }
  public unregisterSound(name: string): void {
    this.managedSounds.delete(name);
  }

  public createSound(name: string, buf: AudioBuffer): Sound {
    const sound = new Sound(buf);
    this.registerSound(name, sound);
    return sound;
  }
  public getSound(name: string): Sound | undefined {
    return this.managedSounds.get(name);
  }
  public hasSound(name: string): boolean {
    return this.managedSounds.has(name);
  }
  public destroySound(name: string): void {
    const sound = this.getSound(name);
    this.unregisterSound(name);
    if (sound) {
      sound.stop();
    }
  }

  public pause(): void {
    if (this.paused) {
      return;
    }
    this.paused = true;
    this.managedSounds.forEach((sound) => sound.pause());
  }
  public resume(): void {
    if (!this.paused) {
      return;
    }
    this.paused = false;
    this.managedSounds.forEach((sound) => sound.resume());
  }

  public fade(sound: Sound, targetVolume: number, seconds: number, stopOnEnd: boolean = false): void {
    if (!SoundManager.sharedContext) {
      return;
    }
    
    sound.gainNode.gain.exponentialRampToValueAtTime(targetVolume, SoundManager.sharedContext.currentTime + seconds);
    if (stopOnEnd) {
      this.soundsKillingAfterFade.push({ sound, targetVolume });
    }
  }

  public update(_dt: number): void {
    if (this.paused) {
      return;
    }

    for (let i = 0; i < this.soundsKillingAfterFade.length; i++) {
      const soundData = this.soundsKillingAfterFade[i];
      if (!soundData.sound.gainNode) {
        continue;
      }
      if (soundData.targetVolume === soundData.sound.gainNode.gain.value) {
        soundData.sound.stop();
      }
    }
  }
}

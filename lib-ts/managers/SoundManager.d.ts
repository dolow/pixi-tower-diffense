import { BrowserInfo, BotInfo, NodeInfo } from 'detect-browser';
import Sound from 'modules/Sound';
export default class SoundManager {
    static instance: SoundManager;
    static readonly sharedContext: AudioContext | null;
    private static context;
    private static loaderMiddlewareAdded;
    private soundsKillingAfterFade;
    constructor();
    static init(ctx?: AudioContext): void;
    static addLoaderMiddleware(browser: BrowserInfo | BotInfo | NodeInfo): void;
    static decodeAudio(binary: any, callback: (buf: AudioBuffer) => void): void;
    static decodeAudioWithPromise(binary: any, callback: (buf: AudioBuffer) => void): void;
    static setSoundInitializeEvent(browser: BrowserInfo | BotInfo | NodeInfo): void;
    fade(sound: Sound, targetVolume: number, seconds: number, stopOnEnd?: boolean): void;
    update(_dt: number): void;
}

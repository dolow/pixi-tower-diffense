import SoundManager from 'managers/SoundManager';

/**
 * サウンド処理を行うクラス
 */
export default class Sound {
  /**
   * ボリュームのセッタ
   */
  public set volume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }
  /**
   * ボリュームのゲッタ
   */
  public get volume(): number {
    return this.gainNode ? this.gainNode.gain.value : -1;
  }

  /**
   * サウンド再生時間を返す
   */
  public get elapsedTime(): number {
    if (this.paused) {
      return this.offset;
    }

    const audioContext = SoundManager.sharedContext;
    if (!this.source || !audioContext) {
      return 0;
    }

    const playedTime = audioContext.currentTime - this.playedAt;

    // ループ再生の場合は合計の再生時間から割り出す
    if (this.source.loop) {
      const playLength = this.source.loopEnd - this.source.loopStart;
      if (playedTime > playLength) {
        return this.source.loopStart + (playedTime % playLength);
      }
    }
    return playedTime;
  }

  /**
   * GainNode インスタンス
   */
  public gainNode!: GainNode;
  /**
   * ループ再生フラグ
   */
  public loop: boolean = false;

  /**
   * AudioBuffer インスタンス
   */
  private buffer!: AudioBuffer;

  /**
   * AudioBufferSourceNode インスタンス
   */
  private source: AudioBufferSourceNode | null = null;

  /**
   * 再生開始フラグ
   */
  private played: boolean = false;
  /**
   * 一時停止フラグ
   */
  private paused: boolean = false;
  /**
   * サウンド再生開始時間オフセット
   */
  private offset: number = 0;
  /**
   * AudioContext インスタンスの currentTime を基準に保持する再生開始時間
   */
  private playedAt: number = 0;

  /**
   * コンストラクタ
   * AudioBuffer はユーザ側で用意する
   */
  constructor(buf: AudioBuffer) {
    if (!SoundManager.sharedContext) {
      return;
    }

    this.buffer = buf;
    this.gainNode = SoundManager.sharedContext.createGain();
  }

  /**
   * 再生開始
   */
  public play(loop: boolean = false, offset: number = 0): void {
    const audioContext = SoundManager.sharedContext;
    if (!audioContext) {
      return;
    }

    this.loop = loop;

    // AudioSourceNode の初期化
    this.source = audioContext.createBufferSource();
    this.source.loop      = this.loop;
    this.source.loopStart = 0;
    this.source.loopEnd   = this.buffer.duration as number;
    this.source.buffer    = this.buffer;
    this.source.onended = () => this.stop();

    this.gainNode.connect(audioContext.destination);
    this.source.connect(this.gainNode);
    this.source.start(0, offset);

    this.playedAt = audioContext.currentTime - offset;

    this.paused = false;
    this.played = true;
  }
  /**
   * 停止
   */
  public stop(): void {
    if (!this.source || !this.played) {
      return;
    }

    this.source.disconnect();

    try {
      (this.source as any).buffer  = null;
    } catch (_e) {
      // Chrome 59 以下は null 代入できない
      // 後続の処理に問題はないので正常系処理に戻す
    }

    this.source.onended = null;
    this.source = null;

    this.paused = false;
  }
  /**
   * 一時停止
   */
  public pause(): void {
    if (this.paused || !this.played) {
      return;
    }
    this.offset = this.elapsedTime;
    this.stop();

    this.paused = true;
  }
  /**
   * 再開
   */
  public resume(): void {
    if (!this.paused || !this.played) {
      return;
    }
    this.play(this.loop, this.offset);

    this.paused = false;
  }
}

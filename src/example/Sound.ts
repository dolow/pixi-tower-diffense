import SoundManager from 'example/SoundManager';

/**
 * サウンド処理を行うクラス
 */
export default class Sound {
  /**
   * GainNode インスタンス
   */
  public gainNode!: GainNode;

  /**
   * AudioBuffer インスタンス
   */
  private buffer!: AudioBuffer;

  /**
   * AudioBufferSourceNode インスタンス
   */
  private source: AudioBufferSourceNode | null = null;

  
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

    // AudioSourceNode の初期化
    this.source = audioContext.createBufferSource();
    this.source.loop      = loop;
    this.source.loopStart = 0;
    this.source.loopEnd   = this.buffer.duration as number;
    this.source.buffer    = this.buffer;
    // this.source.onended = () => this.stop();

    this.gainNode.connect(audioContext.destination);
    this.source.connect(this.gainNode);
    this.source.start(0, offset);
  }
  /**
   * 停止
   */
  public stop(): void {

  }
  /**
   * 一時停止
   */
  public pause(): void {

  }
  /**
   * 再開
   */
  public resume(): void {

  }
}

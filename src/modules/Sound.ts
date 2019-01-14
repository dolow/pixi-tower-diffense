import SoundManager from 'managers/SoundManager';

export default class Sound {
  public set loop(value: boolean) {
    if (this.source) {
      this.source.loop = value;
    }
  }
  public get loop(): boolean {
    return this.source ? this.source.loop : false;
  }

  public set volume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }
  public get volume(): number {
    return this.gainNode ? this.gainNode.gain.value : -1;
  }

  private source: AudioBufferSourceNode | null = null;
  public gainNode: GainNode | null = null;

  constructor(buf: AudioBuffer) {
    if (!SoundManager.sharedContext) {
      return;
    }

    this.source = SoundManager.sharedContext.createBufferSource();
    this.source.loopStart = 0;
    this.source.loopEnd   = buf.duration as number;
    this.source.buffer    = buf;
    this.source.onended = () => this.stop();

    this.gainNode = SoundManager.sharedContext.createGain();
  }

  public play(): void {
    if (!this.gainNode || !this.source || !SoundManager.sharedContext) {
      return;
    }
    this.gainNode.connect(SoundManager.sharedContext.destination);
    this.source.connect(this.gainNode);
    this.source.start(0, 0);
  }
  public stop(): void {
    if (!this.gainNode || !this.source) {
      return;
    }
    this.source.disconnect();

    try {
      (this.source as any).buffer  = null;
    } catch (_e) {
      // Pass through, Chrome <= 59 does not accept null
    }

    this.source.onended = null;
    this.source = null;
    this.gainNode = null;
  }
}

export default class Sound {
    volume: number;
    readonly elapsedTime: number;
    gainNode: GainNode;
    loop: boolean;
    private buffer;
    private source;
    private paused;
    private offset;
    private playedAt;
    constructor(buf: AudioBuffer);
    play(loop?: boolean, offset?: number): void;
    stop(): void;
    pause(): void;
    resume(): void;
}

export default class Sound {
    loop: boolean;
    volume: number;
    private source;
    gainNode: GainNode | null;
    constructor(buf: AudioBuffer);
    play(): void;
    stop(): void;
}

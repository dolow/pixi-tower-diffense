import UpdateObject from 'display/UpdateObject';
export default class Dead extends UpdateObject {
    private static resourceListCache;
    private bucket;
    private spirit;
    private elapsedFrameCount;
    static readonly resourceList: string[];
    constructor(flip: boolean);
    update(_delta: number): void;
}

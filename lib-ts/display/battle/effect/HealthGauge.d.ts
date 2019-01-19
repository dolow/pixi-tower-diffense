import UpdateObject from 'display/UpdateObject';
export default class HealthGaugeEffect extends UpdateObject {
    gaugeWidth: number;
    gaugeHeight: number;
    maxColor: number;
    currentColor: number;
    lineColor: number;
    private elapsedFrameCount;
    private reducingFrameCount;
    private remainingFrameCount;
    private maxGraphic;
    private currentGraphic;
    private fromPercent;
    private toPercent;
    static readonly resourceList: string[];
    constructor(fromPercent: number, toPercent: number);
    update(_delta: number): void;
}

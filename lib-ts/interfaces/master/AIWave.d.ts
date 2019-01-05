/**
 * AI ユニットの出現情報
 */
export default interface AIWaveMaster {
    waves: {
        [key: string]: {
            unitId: number;
        }[];
    };
}

/**
 * AI ユニットの出現情報マスターのスキーマ定義
 */
export default interface AIWaveMaster {
  waves: {
    [key: string]: {
      unitId: number;
    }[];
  };
}

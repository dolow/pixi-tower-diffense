/**
 * ステージ情報マスターのスキーマ定義
 */
export default interface StageMaster {
  id: number;
  length: number;
  zLines: number;
  waves: {
    [key: string]: {
      unitId: number;
    }[];
  };
}

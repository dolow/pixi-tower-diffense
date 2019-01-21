/**
 * ステージ情報マスターのスキーマ定義
 */
export default interface StageMaster {
  id: number;
  length: number;
  zLines: number;
  playerBase: {
    position: {
      x: number;
    };
  };
  aiBase: {
    baseId: number;
    position: {
      x: number;
    };
    health: number;
  };
  waves: {
    [key: string]: {
      unitId: number;
    }[];
  };
}

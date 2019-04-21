/**
 * ステージ情報マスターのスキーマ定義
 */
export default interface StageMaster {
  id: number;
  length: number;
  zLines: number;
  playerCastle: {
    position: {
      x: number;
    };
  };
  aiCastle: {
    castleId: number;
    position: {
      x: number;
    };
  };
  waves: {
    [key: string]: {
      unitId: number;
    }[];
  };
}

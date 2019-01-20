/**
 * フィールド情報マスターのスキーマ定義
 */
export default interface FieldMaster {
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
}

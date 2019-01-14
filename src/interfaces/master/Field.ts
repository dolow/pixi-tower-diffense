/**
 * フィールド情報
 */
export default interface FieldMaster {
  id: number;
  length: number;
  playerBase: {
    position: {
      x: number;
    };
  };
  aiBase: {
    position: {
      x: number;
    };
    health: number;
  };
}

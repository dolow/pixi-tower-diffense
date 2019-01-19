/**
 * ユニットアニメーションマスターのスキーマ定義
 */
export default interface UnitAnimationMaster {
  unitId:      number;
  hitFrame:    number;
  maxFrameIndexes: { [key: string]: number };
  updateDurations: { [key: string]: number };
}

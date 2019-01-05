/**
 * ユニットパラメータマスターのスキーマ定義
 */
export default interface UnitMaster {
  // data
  unitId:      number;
  cost:        number;
  maxHealth:   number;
  power:       number;
  speed:       number;
  wieldFrames: number;
  hitFrame:    number;

  // animation
  animationMaxFrameIndexes: { [key: string]: number };
  animationUpdateDurations: { [key: string]: number };
}

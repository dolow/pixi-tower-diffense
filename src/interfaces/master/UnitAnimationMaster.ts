/**
 * ユニットアニメーションマスターのスキーマ定義
 */
export default interface UnitAnimationMaster {
  unitId:   number;
  hitFrame: number;
  types: {
    [key: string]: {
      maxFrameIndex:  number;
      updateDuration: number;
    }
  };
}

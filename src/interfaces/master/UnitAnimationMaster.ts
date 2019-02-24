export type UnitAnimationTypeIndex = 'wait' | 'walk' | 'attack' | 'damage';
/**
 * ユニットアニメーションマスターのスキーマ定義
 */
export default interface UnitAnimationMaster {
  unitId: number;
  hitFrame: number;
  types: {
    [key in UnitAnimationTypeIndex]: {
      updateDuration: number;
      frames: string[];
    }
  };
}

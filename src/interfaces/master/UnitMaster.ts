import AttackableMaster from 'interfaces/master/AttackableMaster';
/**
 * ユニットパラメータマスターのスキーマ定義
 */
export default interface UnitMaster extends AttackableMaster {
  unitId: number;
}

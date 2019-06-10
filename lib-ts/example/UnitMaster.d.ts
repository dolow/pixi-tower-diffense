import AttackableMaster from 'example/AttackableMaster';
/**
 * ユニットパラメータマスターのスキーマ定義
 */
export default interface UnitMaster extends AttackableMaster {
    unitId: number;
}

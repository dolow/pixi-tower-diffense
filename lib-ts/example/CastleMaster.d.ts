import AttackableMaster from 'example/AttackableMaster';
/**
 * 拠点パラメータマスターのスキーマ定義
 */
export default interface CastleMaster extends AttackableMaster {
    castleId: number;
}

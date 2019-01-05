import Scene from 'scenes/Scene';
/**
 * リソースの URL や命名規則のマスタ
 */
declare const ResourceMaster: Readonly<{
    UnitAnimationTypes: Readonly<{
        WAIT: string;
        WALK: string;
        ATTACK: string;
        DAMAGE: string;
    }>;
    SceneUiGraph: (scene: Scene) => string;
    FieldEntryPoint: () => string;
    Field: (fieldId: number) => string;
    AIWaveEntryPoint: () => string;
    AIWave: (stageId: number) => string;
    UnitEntryPoint: () => string;
    Unit: (unitIds: number[]) => string;
    UnitTexture: (unitId: number) => string;
    UnitPanelTexture: (unitId: number) => string;
    BattleBgForeTileCount: number;
    BattleBgMiddleTileCount: number;
    BattleBgBackTileCount: number;
    BattleBgFore: () => string[];
    BattleBgMiddle: () => string[];
    BattleBgBack: () => string[];
    UnitTextureFrameName: (unitActionType: string, unitId: number, index: number) => string;
    Dead: {
        Bucket: () => string;
        Spirit: () => string;
    };
}>;
export default ResourceMaster;

import Scene from 'scenes/Scene';
declare const ResourceMaster: Readonly<{
    UnitAnimationTypes: Readonly<{
        WAIT: string;
        WALK: string;
        ATTACK: string;
        DAMAGE: string;
        DYING: string;
    }>;
    SceneUiGraph: (scene: Scene) => string;
    UnitMasterEntryPoint: () => string;
    UnitMaster: (unitIds: number[]) => string;
    UnitTexture: (unitId: number) => string;
    UnitPanelTexture: (unitId: number) => string;
    BattleBgForeTileCount: number;
    BattleBgFore: () => string[];
    UnitTextureFrameName: (unitActionType: string, unitId: number, index: number) => string;
}>;
export default ResourceMaster;

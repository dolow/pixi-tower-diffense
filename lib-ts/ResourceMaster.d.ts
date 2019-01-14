import Scene from 'scenes/Scene';
/**
 * リソースの URL や命名規則のマスタ
 */
declare const ResourceMaster: Readonly<{
    SceneUiGraph: {
        ApiEntryPoint: () => string;
        Api: (scene: Scene) => string;
    };
    Field: {
        ApiEntryPoint: () => string;
        Api: (fieldId: number) => string;
    };
    AiWave: {
        ApiEntryPoint: () => string;
        Api: (stageId: number) => string;
    };
    Unit: {
        AnimationTypes: Readonly<{
            WAIT: string;
            WALK: string;
            ATTACK: string;
            DAMAGE: string;
        }>;
        ApiEntryPoint: () => string;
        Api: (unitIds: number[]) => string;
        Texture: (unitId: number) => string;
        PanelTexture: (unitId: number) => string;
        TextureFrameName: (unitActionType: string, unitId: number, index: number) => string;
    };
    Base: {
        AnimationTypes: Readonly<{
            IDLE: string;
            SPAWN: string;
            COLLAPSE: string;
        }>;
        ApiEntryPoint: () => string;
        Api: (playerBaseId: number, aiBaseId: number) => string;
        Texture: (baseId: number) => string;
        TextureFrameName: (baseId: number, index?: number) => string;
    };
    BattleBg: {
        TileCount: {
            Fore: number;
            Middle: number;
            Back: number;
        };
        Fore: () => string[];
        Middle: () => string[];
        Back: () => string[];
    };
    Dead: {
        Bucket: () => string;
        Spirit: () => string;
    };
    CollapseExplode: {
        MaxFrameIndex: number;
        Api: () => string;
        TextureFrameName: (index?: number) => string;
    };
    BattleResult: {
        Win: {
            Api: () => string;
        };
        Lose: {
            Api: () => string;
        };
    };
}>;
export default ResourceMaster;

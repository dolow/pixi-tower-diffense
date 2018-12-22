import Scene from 'scenes/Scene';
declare const ResourceMaster: Readonly<{
    SceneUiGraph: (scene: Scene) => string;
    Unit: (unitId: number) => string;
    UnitPanel: (unitId: number) => string;
}>;
export default ResourceMaster;

import Config from  'Config';
import Scene from  'scenes/Scene';

const ResourceMaster = Object.freeze({
  SceneUiGraph: (scene: Scene) => {
    const snake_case = scene.constructor.name.replace(/([A-Z])/g,
      (s) => { return `_${s.charAt(0).toLowerCase()}`; }
    ).replace(/^_/, '');
    
    return `${Config.ResourceBaseUrl}/ui_graph/${snake_case}.json`;
  },
  Unit: (unitId: number) => {
    return `${Config.ResourceBaseUrl}/units/${unitId}.json`;
  },
  UnitPanel: (unitId: number) => {
    if (unitId <= 0) {
      return `${Config.ResourceBaseUrl}/ui/units_panel/button/unit_empty.png`;
    }
    return `${Config.ResourceBaseUrl}/ui/units_panel/button/unit_${unitId}.png`;
  }
});

export default ResourceMaster;

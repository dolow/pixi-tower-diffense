import Config from  'Config';
import Scene from  'scenes/Scene';

const ResourceMaster = Object.freeze({
  UnitAnimationTypes: Object.freeze({
    WAIT: 'wait',
    WALK: 'walk',
    ATTACK: 'attack',
    DAMAGE: 'damage',
    DYING: 'dying'
  }),

  SceneUiGraph: (scene: Scene): string => {
    const snake_case = scene.constructor.name.replace(/([A-Z])/g,
      (s) => { return `_${s.charAt(0).toLowerCase()}`; }
    ).replace(/^_/, '');

    return `${Config.ResourceBaseUrl}/ui_graph/${snake_case}.json`;
  },
  UnitMasterEntryPoint: (): string => {
    return `${Config.ResourceBaseUrl}/master/unit_master.json`;
  },
  UnitMaster: (unitIds: number[]): string => {
    const joinedUnitIds = unitIds.join('&unitId[]=');
    return `${ResourceMaster.UnitMasterEntryPoint()}?unitId[]=${joinedUnitIds}`;
  },
  UnitTexture: (unitId: number): string => {
    return `${Config.ResourceBaseUrl}/units/${unitId}.json`;
  },
  UnitPanelTexture: (unitId: number): string => {
    if (unitId <= 0) {
      return `${Config.ResourceBaseUrl}/ui/units_panel/button/unit_empty.png`;
    }
    return `${Config.ResourceBaseUrl}/ui/units_panel/button/unit_${unitId}.png`;
  },

  BattleBgForeTileCount: 10,
  BattleBgFore: (): string[] => {
    const list = [];
    for (let i = 1; i <= ResourceMaster.BattleBgForeTileCount; i++) {
      list.push(`${Config.ResourceBaseUrl}/battle/bg_1_${i}.png`);
    }
    return list;
  },

  UnitTextureFrameName: (unitActionType: string, unitId: number, index: number): string => {
    return `unit_${unitId}_${unitActionType}_${index}.png`;
  }
});

export default ResourceMaster;

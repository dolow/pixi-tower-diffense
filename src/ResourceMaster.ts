import Config from  'Config';
import Scene from  'scenes/Scene';

/**
 * リソースの URL や命名規則のマスタ
 */
const ResourceMaster = Object.freeze({
  UnitAnimationTypes: Object.freeze({
    WAIT: 'wait',
    WALK: 'walk',
    ATTACK: 'attack',
    DAMAGE: 'damage'
  }),

  SceneUiGraph: (scene: Scene): string => {
    const snake_case = scene.constructor.name.replace(/([A-Z])/g,
      (s) => { return `_${s.charAt(0).toLowerCase()}`; }
    ).replace(/^_/, '');

    return `${Config.ResourceBaseUrl}/ui_graph/${snake_case}.json`;
  },
  FieldEntryPoint: (): string => {
    return `${Config.ResourceBaseUrl}/master/field_master.json`;
  },
  Field: (fieldId: number): string => {
    return `${ResourceMaster.FieldEntryPoint()}?fieldId=${fieldId}`;
  },
  AIWaveEntryPoint: (): string => {
    return `${Config.ResourceBaseUrl}/master/ai_wave_master.json`;
  },
  AIWave: (stageId: number): string => {
    return `${ResourceMaster.AIWaveEntryPoint()}?stageId=${stageId}`;
  },
  UnitEntryPoint: (): string => {
    return `${Config.ResourceBaseUrl}/master/unit_master.json`;
  },
  Unit: (unitIds: number[]): string => {
    const joinedUnitIds = unitIds.join('&unitId[]=');
    return `${ResourceMaster.UnitEntryPoint()}?unitId[]=${joinedUnitIds}`;
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
  BattleBgMiddleTileCount: 6,
  BattleBgBackTileCount: 3,
  BattleBgFore: (): string[] => {
    const list = [];
    for (let i = 1; i <= ResourceMaster.BattleBgForeTileCount; i++) {
      list.push(`${Config.ResourceBaseUrl}/battle/bg_1_${i}.png`);
    }
    return list;
  },
  BattleBgMiddle: (): string[] => {
    const list = [];
    for (let i = 1; i <= ResourceMaster.BattleBgMiddleTileCount; i++) {
      list.push(`${Config.ResourceBaseUrl}/battle/bg_2_${i}.png`);
    }
    return list;
  },
  BattleBgBack: (): string[] => {
    const list = [];
    for (let i = 1; i <= ResourceMaster.BattleBgBackTileCount; i++) {
      list.push(`${Config.ResourceBaseUrl}/battle/bg_3_${i}.png`);
    }
    return list;
  },

  UnitTextureFrameName: (unitActionType: string, unitId: number, index: number): string => {
    return `unit_${unitId}_${unitActionType}_${index}.png`;
  },

  Dead: {
    Bucket: () => {
      return `${Config.ResourceBaseUrl}/battle/effects/dead/dead_bucket.png`;
    },
    Spirit: () => {
      return `${Config.ResourceBaseUrl}/battle/effects/dead/dead_spirit.png`;
    }
  }
});

export default ResourceMaster;

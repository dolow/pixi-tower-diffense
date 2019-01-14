import Config from  'Config';
import Scene from  'scenes/Scene';

/**
 * リソースの URL や命名規則のマスタ
 */
const ResourceMaster = Object.freeze({
  SceneUiGraph: {
    ApiEntryPoint: (): string => {
      return `${Config.ResourceBaseUrl}/ui_graph`;
    },
    Api: (scene: Scene): string => {
      const snake_case = scene.constructor.name.replace(/([A-Z])/g,
        (s) => { return `_${s.charAt(0).toLowerCase()}`; }
      ).replace(/^_/, '');

      return `${ResourceMaster.SceneUiGraph.ApiEntryPoint()}/${snake_case}.json`;
    }
  },

  Field: {
    ApiEntryPoint: (): string => {
      return `${Config.ResourceBaseUrl}/master/field_master.json`;
    },
    Api: (fieldId: number): string => {
      return `${ResourceMaster.Field.ApiEntryPoint()}?fieldId=${fieldId}`;
    }
  },

  AiWave: {
    ApiEntryPoint: (): string => {
      return `${Config.ResourceBaseUrl}/master/ai_wave_master.json`;
    },
    Api: (stageId: number): string => {
      return `${ResourceMaster.AiWave.ApiEntryPoint()}?stageId=${stageId}`;
    }
  },

  Unit: {
    AnimationTypes: Object.freeze({
      WAIT: 'wait',
      WALK: 'walk',
      ATTACK: 'attack',
      DAMAGE: 'damage'
    }),

    ApiEntryPoint: (): string => {
      return `${Config.ResourceBaseUrl}/master/unit_master.json`;
    },
    Api: (unitIds: number[]): string => {
      const joinedUnitIds = unitIds.join('&unitId[]=');
      return `${ResourceMaster.Unit.ApiEntryPoint()}?unitId[]=${joinedUnitIds}`;
    },
    Texture: (unitId: number): string => {
      return `${Config.ResourceBaseUrl}/units/${unitId}.json`;
    },
    PanelTexture: (unitId: number): string => {
      if (unitId <= 0) {
        return `${Config.ResourceBaseUrl}/ui/units_panel/button/unit_empty.png`;
      }
      return `${Config.ResourceBaseUrl}/ui/units_panel/button/unit_${unitId}.png`;
    },
    TextureFrameName: (unitActionType: string, unitId: number, index: number): string => {
      return `unit_${unitId}_${unitActionType}_${index}.png`;
    }
  },

  Base: {
    AnimationTypes: Object.freeze({
      IDLE: 'idle',
      SPAWN: 'spawn'
    }),

    ApiEntryPoint: (): string => {
      return `${Config.ResourceBaseUrl}/master`;
    },
    Api: (playerBaseId: number, aiBaseId: number): string => {
      return `${ResourceMaster.Base.ApiEntryPoint()}/base_master.json?playerBaseId=${playerBaseId}&aiBaseId=${aiBaseId}`;
    },
    Texture: (baseId: number): string => {
      return `${Config.ResourceBaseUrl}/battle/base/${baseId}.json`;
    },
    TextureFrameName: (baseId: number, index: number = 1): string => {
      return `base_${baseId}_${index}.png`;
    }
  },

  BattleBg: {
    TileCount: {
      Fore: 10,
      Middle: 6,
      Back: 3
    },
    Fore: (): string[] => {
      const list = [];
      for (let i = 1; i <= ResourceMaster.BattleBg.TileCount.Fore; i++) {
        list.push(`${Config.ResourceBaseUrl}/battle/bg_1_${i}.png`);
      }
      return list;
    },
    Middle: (): string[] => {
      const list = [];
      for (let i = 1; i <= ResourceMaster.BattleBg.TileCount.Middle; i++) {
        list.push(`${Config.ResourceBaseUrl}/battle/bg_2_${i}.png`);
      }
      return list;
    },
    Back: (): string[] => {
      const list = [];
      for (let i = 1; i <= ResourceMaster.BattleBg.TileCount.Back; i++) {
        list.push(`${Config.ResourceBaseUrl}/battle/bg_3_${i}.png`);
      }
      return list;
    }
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

/// <reference types="pixi.js" />
import Scene from 'scenes/Scene';
/**
 * リソースの URL や命名規則のマスタ
 */
declare const ResourceMaster: Readonly<{
    Api: {
        SceneUiGraph: (scene: Scene) => string;
        Field: (fieldId: number) => string;
        AiWave: (stageId: number) => string;
        Unit: (unitIds: number[]) => string;
        Base: (playerBaseId: number, aiBaseId: number) => string;
    };
    Dynamic: {
        Unit: (unitId: number) => string;
        UnitPanel: (unitId?: number | undefined) => string;
        Base: (baseId: number) => string;
    };
    Static: {
        BattleBgFores: string[];
        BattleBgMiddles: string[];
        BattleBgBacks: string[];
        AttackSmoke: string;
        DeadBucket: string;
        DeadSpirit: string;
        CollapseExplode: string;
        BattleResultWin: string;
        BattleResultLose: string;
    };
    Audio: {
        Bgm: {
            Title: string;
            Battle: string;
        };
        Se: {
            Attack1: string;
            Attack2: string;
            Bomb: string;
            UnitSpawn: string;
            Win: string;
            Lose: string;
        };
    };
    TextureFrame: {
        Unit: (unitActionType: string, unitId: number, index: number) => PIXI.Texture;
        Base: (baseId: number, index?: number) => PIXI.Texture;
        CollapseExplode: (index?: number) => PIXI.Texture;
        AttackSmoke: (index?: number) => PIXI.Texture;
    };
    AnimationTypes: {
        Unit: Readonly<{
            WAIT: string;
            WALK: string;
            ATTACK: string;
            DAMAGE: string;
        }>;
        Base: Readonly<{
            IDLE: string;
            SPAWN: string;
            COLLAPSE: string;
        }>;
    };
    MaxFrameIndex: (resourceKey: string) => number;
}>;
export default ResourceMaster;

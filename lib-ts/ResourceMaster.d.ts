/// <reference types="pixi.js" />
import Scene from 'scenes/Scene';
/**
 * リソースの URL や命名規則のマスタ
 */
declare const ResourceMaster: Readonly<{
    /**
     * マスターデータ API 情報を有するオブジェクト
     */
    Api: {
        SceneUiGraph: (scene: Scene) => string;
        Field: (fieldId: number) => string;
        AiWave: (stageId: number) => string;
        Unit: (unitIds: number[]) => string;
        Base: (playerBaseId: number, aiBaseId: number) => string;
    };
    /**
     * 渡されたパラメータによって動的に変わる url を有するオブジェクト
     */
    Dynamic: {
        Unit: (unitId: number) => string;
        UnitPanel: (unitId?: number | undefined) => string;
        Base: (baseId: number) => string;
    };
    /**
     * 静的なリソースを有するオブジェクト
     */
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
    /**
     * サウンドリソースの静的な url を有するオブジェクト
     */
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
    /**
     * テクスチャのフレーム名を返す関数を有するオブジェクト
     */
    TextureFrame: {
        Unit: (unitActionType: string, unitId: number, index: number) => PIXI.Texture;
        Base: (baseId: number, index?: number) => PIXI.Texture;
        CollapseExplode: (index?: number) => PIXI.Texture;
        AttackSmoke: (index?: number) => PIXI.Texture;
    };
    /**
     * アニメーション種別の識別子を有するオブジェクト
     */
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
    /**
     * スプライトシートの最大フレーム数を返す関数
     */
    MaxFrameIndex: (resourceKey: string) => number;
}>;
export default ResourceMaster;

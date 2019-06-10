/// <reference types="pixi.js" />
import Scene from 'example/Scene';
/**
 * リソースの URL や命名規則のマスタ
 */
declare const Resource: Readonly<{
    /**
     * マスターデータ API 情報を有するオブジェクト
     */
    Api: {
        UserBattle: (userId: number) => string;
        UnitAnimation: (unitIds: number[]) => string;
        AllUnit: () => string;
        Unit: (unitIds: number[]) => string;
        Castle: (castleIds: number[]) => string;
        Stage: (stageId: number) => string;
    };
    /**
     * シーン名から UI Graph 用のファイル名を生成
     */
    SceneUiGraph: (scene: Scene) => string;
    /**
     * 静的なリソースを有するオブジェクト
     */
    Static: {
        BattleBgFores: string[];
        BattleBgMiddles: string[];
        BattleBgBacks: string[];
    };
    Dynamic: {
        Unit: (unitId: number) => string;
        Castle: (castleId: number) => string;
        UnitPanel: (unitId: number) => string;
    };
    TextureFrame: {
        Castle: (castleId: number, index?: number) => PIXI.Texture;
    };
    Audio: {
        Bgm: {
            Title: string;
            Battle: string;
        };
        Se: {
            Attack1: string;
            Attack2: string;
            UnitSpawn: string;
            Win: string;
            Lose: string;
        };
    };
    AnimationTypes: {
        Unit: {
            WAIT: string;
            WALK: string;
            ATTACK: string;
            DAMAGE: string;
        };
    };
    FontFamily: {
        Css: string;
        Default: string;
    };
}>;
export default Resource;

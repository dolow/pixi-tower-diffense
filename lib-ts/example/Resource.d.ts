import Scene from 'example/Scene';
/**
 * リソースの URL や命名規則のマスタ
 */
declare const Resource: Readonly<{
    /**
     * マスターデータ API 情報を有するオブジェクト
     */
    Api: {
        UnitAnimation: (unitIds: number[]) => string;
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
        UnitPanel: (unitId: number) => string;
    };
    Audio: {
        Bgm: {
            Title: string;
        };
        Se: {};
    };
    FontFamily: {
        Css: string;
        Default: string;
    };
}>;
export default Resource;

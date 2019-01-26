import Scene from 'scenes/Scene';
/**
 * リソースの URL や命名規則のマスタサンプル
 */
declare const Resource: Readonly<{
    /**
     * シーン名から UI Graph 用のファイル名を生成
     */
    SceneUiGraph: (scene: Scene) => string;
    /**
     * 渡されたパラメータによって動的に変わる url を有するオブジェクト
     */
    Dynamic: {
        UnitPanel: (unitId: number) => string;
    };
}>;
export default Resource;

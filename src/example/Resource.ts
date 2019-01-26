import Scene from 'scenes/Scene';

/**
 * リソースの URL や命名規則のマスタサンプル
 */
const Resource = Object.freeze({
  /**
   * シーン名から UI Graph 用のファイル名を生成
   */
  SceneUiGraph: (scene: Scene): string => {
    const snake_case = scene.constructor.name.replace(
      /([A-Z])/g,
      (s) => { return `_${s.charAt(0).toLowerCase()}`; }
    ).replace(/^_/, '');

    return `ui_graph/${snake_case}.json`;
  },
  /**
   * 渡されたパラメータによって動的に変わる url を有するオブジェクト
   */
  Dynamic: {
    UnitPanel: (unitId: number): string => {
      const id = (unitId > 0) ? unitId : 'empty';
      return `ui/units_panel/button/unit_${id}.png`;
    }
  }
});

export default Resource;

import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import TextFactory from 'modules/UiNodeFactory/TextFactory';
import SpriteFactory from 'modules/UiNodeFactory/SpriteFactory';

/**
 * UI を静的に定義しランタイムでロードするためのモジュール
 * 指定されたノードのファクトリを生成して保持する
 */
export default class UiGraph {
  /**
   * ファクトリのキャッシュ
   */
  private static cachedFactory: {
    [key: string]: UiNodeFactory;
  } = {};

  /**
   * ファクトリを取得
   * なければキャッシュを作る
   */
  public static getFactory(type: string): UiNodeFactory | null {
    if (!UiGraph.cachedFactory[type]) {
      let Factory;

      switch (type) {
        case 'text':   Factory = TextFactory;   break;
        case 'sprite': Factory = SpriteFactory; break;
      }

      if (!Factory) {
        return null;
      }

      UiGraph.cachedFactory[type] = new Factory();
    }

    return UiGraph.cachedFactory[type];
  }
}

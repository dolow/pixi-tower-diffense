import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import TextFactory from 'modules/UiNodeFactory/TextFactory';
import SpriteFactory from 'modules/UiNodeFactory/SpriteFactory';

export default class UiGraph {
  private static cachedFactory: {
    [key: string]: UiNodeFactory;
  } = {};

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

import Node from 'interfaces/UiGraph/Node';
import SpriteNodeParams from 'interfaces/UiGraph/SpriteNodeParams';

/**
 * UiGraph スプライトノード定義
 */
export default interface SpriteNode extends Node {
  params: SpriteNodeParams;
}

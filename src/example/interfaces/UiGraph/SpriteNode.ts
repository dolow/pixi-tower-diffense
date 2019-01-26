import Node from 'example/interfaces/UiGraph/Node';
import SpriteNodeParams from 'example/interfaces/UiGraph/SpriteNodeParams';

/**
 * UiGraph スプライトノード定義
 */
export default interface SpriteNode extends Node {
  params: SpriteNodeParams;
}

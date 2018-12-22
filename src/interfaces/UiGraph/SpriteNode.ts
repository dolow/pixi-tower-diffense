import Node from 'interfaces/UiGraph/Node';
import SpriteNodeParams from 'interfaces/UiGraph/SpriteNodeParams';

export default interface SpriteNode extends Node {
  params: SpriteNodeParams;
}

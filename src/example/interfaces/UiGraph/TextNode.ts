import Node from 'example/interfaces/UiGraph/Node';
import TextNodeParams from 'example/interfaces/UiGraph/TextNodeParams';

/**
 * UiGraph テキストノード定義
 */
export default interface TextNode extends Node {
  params: TextNodeParams;
}

import Node from 'interfaces/UiGraph/Node';
import TextNodeParams from 'interfaces/UiGraph/TextNodeParams';
/**
 * UiGraph テキストノード定義
 */
export default interface TextNode extends Node {
    params: TextNodeParams;
}

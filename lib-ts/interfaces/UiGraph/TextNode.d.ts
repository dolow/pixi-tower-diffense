import Node from 'interfaces/UiGraph/Node';
import TextNodeParams from 'interfaces/UiGraph/TextNodeParams';
export default interface TextNode extends Node {
    params: TextNodeParams;
}

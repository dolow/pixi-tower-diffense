import Node from 'interfaces/UiGraph/Node';
import Metadata from 'interfaces/UiGraph/Metadata';
/**
 * UiGparh ルートオブジェクト定義
 */
export default interface Graph {
    nodes: Node[];
    metadata: Metadata;
}

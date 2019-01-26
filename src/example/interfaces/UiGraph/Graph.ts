import Node from 'example/interfaces/UiGraph/Node';
import Metadata from 'example/interfaces/UiGraph/Metadata';

/**
 * UiGparh ルートオブジェクト定義
 */
export default interface Graph {
  nodes: Node[];
  metadata: Metadata;
}

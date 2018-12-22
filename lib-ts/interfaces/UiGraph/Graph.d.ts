import Node from 'interfaces/UiGraph/Node';
import Metadata from 'interfaces/UiGraph/Metadata';
export default interface Graph {
    nodes: Node[];
    metadata: Metadata;
}

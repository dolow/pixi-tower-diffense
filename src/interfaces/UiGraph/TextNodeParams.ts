import NodeParams from 'interfaces/UiGraph/NodeParams';

export default interface TextNodeParams extends NodeParams {
  text: string;
  size: number;
  color: string;
}

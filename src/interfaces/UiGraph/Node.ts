import Event from 'interfaces/UiGraph/Event';

/**
 * UiGraph 基本ノード定義
 */
export default interface Node {
  id: string;
  type: string;
  position: number[];
  children: Node[];
  params?: {
    [key: string]: any;
  };
  events?: Event[];
}

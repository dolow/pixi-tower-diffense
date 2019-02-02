import NodeParams from 'interfaces/UiGraph/NodeParams';
/**
 * UiGraph テキストノードパラメータ定義
 */
export default interface TextNodeParams extends NodeParams {
    family: string;
    text: string;
    size: number;
    color: string;
    padding: number;
}

import NodeParams from 'interfaces/UiGraph/NodeParams';
/**
 * UiGraph スプライトノードパラメータ定義
 */
export default interface SpriteNodeParams extends NodeParams {
    textureName?: string;
    url: string;
}

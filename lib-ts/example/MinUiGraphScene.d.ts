import AbstractUiGraphScene from 'example/AbstractUiGraphScene';
/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class MinUiGraphScene extends AbstractUiGraphScene {
    /**
     * UI 情報として定義されたイベントコールバックメソッド
     */
    onStageArrowTapped(...args: any[]): void;
    onUnitArrowTapped(...args: any[]): void;
    onOkButtonDown(...args: any[]): void;
    onOkButtonUp(...args: any[]): void;
}

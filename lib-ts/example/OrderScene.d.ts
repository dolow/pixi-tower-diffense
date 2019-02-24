import Scene from 'example/Scene';
/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class OrderScene extends Scene {
    /**
     * UI 情報として定義されたイベントコールバックメソッド
     */
    onStageArrowTapped(...args: any[]): void;
    onUnitArrowTapped(...args: any[]): void;
    onOkButtonDown(...args: any[]): void;
    onOkButtonUp(...args: any[]): void;
}

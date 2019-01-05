/**
 * UiGraph Event コンポーネント定義
 */
export default interface Event {
    type: string;
    callback: string;
    arguments: any[];
}

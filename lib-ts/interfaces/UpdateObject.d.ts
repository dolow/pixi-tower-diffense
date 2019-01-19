/**
 * 更新処理が行われるオブジェクトが提供すべきインターフェース
 */
export default interface UpdateObject {
    isDestroyed(): boolean;
    update(_dt: number): void;
}

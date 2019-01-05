import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
/**
 * UI を静的に定義しランタイムでロードするためのモジュール
 * 指定されたノードのファクトリを生成して保持する
 */
export default class UiGraph {
    /**
     * ファクトリのキャッシュ
     */
    private static cachedFactory;
    /**
     * ファクトリを取得
     * なければキャッシュを作る
     */
    static getFactory(type: string): UiNodeFactory | null;
}

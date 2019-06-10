/**
 * indexed db マネージャ
 * レコードを KVS 形式のインターフェースで取り扱う
 */
export default class IndexedDBManager {
    /**
     * このマネージャが扱う固定データベース名
     */
    static readonly dbName: string;
    /**
     * このマネージャが扱うデータベースバージョン
     */
    static readonly dbVersion: number;
    /**
     * このマネージャが扱う固定ストア名
     */
    static readonly storeName: string;
    /**
     * このマネージャが扱う固定ストアのインデックス名称
     */
    static readonly storeIndex: string;
    /**
     * IDBDatabase インスタンス
     */
    private static db;
    /**
     * マネージャを初期化する
     * DB 接続を開き保持しておく
     */
    static init(onError: (e: Event) => void): void;
    /**
     * レコードを保存する
     */
    static put(key: string, data: any, onSuccess?: (e: Event) => void, onError?: (e?: Event) => void): void;
    /**
     * レコードを取得する
     * レコードが存在しなければ undefined を返す
     */
    static get(key: string, onSuccess: (value: any, key: string | undefined) => void, onError?: (e?: Event) => void): void;
    /**
     * レコードを削除する
     */
    static delete(key: string, onSuccess?: (e: Event) => void, onError?: (e?: Event) => void): void;
    /**
     * すべてのレコードを削除する
     */
    static clear(onSuccess?: (e: Event) => void, onError?: (e?: Event) => void): void;
    /**
     * onupgradeneeded コールバックを処理しなければならない時に実行するメソッド
     */
    private static upgradeDB;
    /**
     * トランザクションを生成し、ストアオブジェクトを返す
     */
    private static getStoreObject;
    /**
     * Key/Value をこのマネージャが扱うオブジェクトに変換する
     */
    private static createRecordObject;
}

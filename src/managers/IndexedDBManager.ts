/**
 * ブラウザの indexed db API
 */
const indexedDb = (window as any).indexedDB || (window as any).webkitIndexedDB;

/**
 * 内部利用の indexed db レコードスキーマ
 */
type IndexedDBManagerRecord = {
  key: string;
  value: any;
};

/**
 * indexed db マネージャ
 * レコードを KVS 形式のインターフェースで取り扱う
 */
export default class IndexedDBManager {
  /**
   * このマネージャが扱う固定データベース名
   */
  public static readonly dbName: string = 'sample-game-db';
  /**
   * このマネージャが扱うデータベースバージョン
   */
  public static readonly dbVersion: number = 1;
  /**
   * このマネージャが扱う固定ストア名
   */
  public static readonly storeName: string = 'sample-game-store';
  /**
   * このマネージャが扱う固定ストアのインデックス名称
   */
  public static readonly storeIndex: string = 'key';

  /**
   * IDBDatabase インスタンス
   */
  private static db: IDBDatabase | null = null;

  /**
   * マネージャを初期化する
   */
  public static init(onError: (e: Event) => void): void {
    if (!indexedDb) {
      console.log('indexed db is not supported');
    }

    const request = indexedDb.open(
      IndexedDBManager.dbName,
      IndexedDBManager.dbVersion
    );
    request.onupgradeneeded = (e: Event) => {
      IndexedDBManager.upgradeDB(e);
    };
    request.onsuccess = (e: Event) => {
      const db = (e.target as IDBRequest).result;
      IndexedDBManager.db = db;
    };
    request.onerror = (e: Event) => onError(e);
  }

  /**
   * レコードを保存する
   */
  public static put(
    key: string,
    data: any,
    onSuccess?: (e: Event) => void,
    onError?: (e?: Event) => void
  ): void {
    const store = IndexedDBManager.getStoreObject();
    if (!store) {
      if (onError) {
        onError();
      }
      return;
    }

    const record = IndexedDBManager.createRecordObject(key, data);
    const request = store.put(record);
    if (onSuccess) {
      request.onsuccess = (e) => { onSuccess(e); };
    }
    if (onError) {
      request.onerror = (e) => { onError(e); };
    }
  }

  /**
   * レコードを取得する
   * レコードが存在しなければ undefined を返す
   */
  public static get(
    key: string,
    onSuccess: (value: any, key: string | undefined) => void,
    onError?: (e?: Event) => void
  ): void {
    const store = IndexedDBManager.getStoreObject();
    if (!store) {
      if (onError) {
        onError();
      }
      return;
    }

    const request = store.get(key);
    request.onsuccess = (e) => {
      const result = (e.target as IDBRequest).result as IndexedDBManagerRecord;
      (result)
        ? onSuccess(result.value, result.key)
        : onSuccess(undefined, undefined);
    };
    if (onError) {
      request.onerror = (e) => { onError(e); };
    }
  }

  /**
   * レコードを削除する
   */
  public static delete(
    key: string,
    onSuccess?: (e: Event) => void,
    onError?: (e?: Event) => void
  ): void {
    const store = IndexedDBManager.getStoreObject();
    if (!store) {
      if (onError) {
        onError();
      }
      return;
    }

    const request = store.delete(key);
    if (onSuccess) {
      request.onsuccess = (e) => { onSuccess(e); };
    }
    if (onError) {
      request.onerror = (e) => { onError(e); };
    }
  }

  /**
   * すべてのレコードを削除する
   */
  public static clear(onSuccess?: (e: Event) => void, onError?: (e?: Event) => void): void {
    const store = IndexedDBManager.getStoreObject();
    if (!store) {
      if (onError) {
        onError();
      }
      return;
    }

    const request = store.clear();
    if (onSuccess) {
      request.onsuccess = (e) => { onSuccess(e); };
    }
    if (onError) {
      request.onerror = (e) => { onError(e); };
    }
  }

  /**
   * onupgradeneeded コールバックを処理しなければならない時に実行するメソッド
   */
  private static upgradeDB(e: Event): void {
    const db = (e.target as IDBRequest).result;

    const index = IndexedDBManager.storeIndex;
    const store = db.createObjectStore(IndexedDBManager.storeName, { keyPath: index });
    store.createIndex(index, index, { unique: true });
  }

  /**
   * トランザクションを生成し、ストアオブジェクトを返す
   */
  private static getStoreObject(): IDBObjectStore | null {
    if (!IndexedDBManager.db) {
      return null;
    }
    const storeName = IndexedDBManager.storeName;
    const transaction = IndexedDBManager.db.transaction(storeName, 'readwrite');
    return transaction.objectStore(storeName);
  }

  /**
   * Key/Value をこのマネージャが扱うオブジェクトに変換する
   */
  private static createRecordObject(key: string, value: any): IndexedDBManagerRecord {
    return { key, value };
  }
}

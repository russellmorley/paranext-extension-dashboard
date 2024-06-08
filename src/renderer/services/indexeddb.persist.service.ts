import { IPersist } from 'src/types/persist.type';

export class IndexedDbPersist implements IPersist {
  db: IDBDatabase | undefined;
  objectStore: string;

  constructor(objectStore: string) {
    this.objectStore = objectStore;
  }

  openDb(dbName: string, dbVersion: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const openRequest = indexedDB.open(dbName, dbVersion);
      const instance = this;
      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(instance.objectStore)) {
          db.createObjectStore(instance.objectStore, { keyPath: 'storeKey' });
        }
        instance.db = db;
        resolve();
      };
    });
  }

  // TODO: Pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string): Promise<any[] | undefined> {
    // TODO: Pick a better type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Promise<any[] | undefined>((resolve, reject) => {
      // const value = localStorage.getItem(`${this.prefix}_${key}`);
      // if (value)
      //   resolve(JSON.parse(value));
      // else
      //   resolve(undefined);
      // });
      try {
        if (!this.db) {
          reject(new Error('db not set'));
          return;
        }
        const request = this.db
          .transaction([this.objectStore], 'readwrite')
          .objectStore(this.objectStore)
          .getKey(key);
        request.onsuccess = () => {
          // TODO: Pick a better type
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-type-assertion/no-type-assertion
          resolve(request.result as any[]);
        };
        request.onerror = (error) => {
          reject(JSON.stringify(error));
        };
      } catch (e) {
        reject(JSON.stringify(e));
      }
    });
  }

  // TODO: Fix this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, items: any[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // localStorage.setItem(`${this.prefix}_${key}`, JSON.stringify(items));
      // resolve();
      try {
        if (!this.db) {
          reject(new Error('db not set'));
          return;
        }
        const transaction = this.db.transaction([this.objectStore], 'readwrite');
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = (event) => {
          reject(new Error(`Couldn't create transaction: ${JSON.stringify(event)}`));
        };

        const store = transaction.objectStore(this.objectStore);

        items.forEach((item) => {
          item.storeKey = key;
        });

        try {
          const request = store.add({ storeKey: key, items });
          request.onerror = (event) => {
            reject(new Error(`Couldn't add: ${JSON.stringify(event)}`));
          };
        } catch (ConstraintError) {
          const request = store.put({ storeKey: key, items });
          request.onerror = (event) => {
            reject(new Error(`Couldn't put: ${JSON.stringify(event)}`));
          };
        }
      } catch (e) {
        reject(JSON.stringify(e));
      }
    });
  }

  remove(key: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // localStorage.removeItem(`${this.prefix}_${key}`);
      // resolve();
      try {
        if (!this.db) {
          reject(new Error('db not set'));
          return;
        }
        const request = this.db
          .transaction([this.objectStore], 'readwrite')
          .objectStore(this.objectStore)
          .delete(key);
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = (error) => {
          reject(JSON.stringify(error));
        };
      } catch (e) {
        reject(JSON.stringify(e));
      }
    });
  }

  /**
   * Clears all keys starting with prefix.
   */
  // clear(): Promise<void> {
  //   return new Promise<void>((resolve) => {
  //     let keys: Array<string> = new Array<string>();
  //     for (let i = 0; i < localStorage.length; i++) {
  //       const key = localStorage.key(i);
  //       if (key?.indexOf(this.prefix) == 0)
  //         keys.push(key);
  //       keys.forEach((key) => localStorage.removeItem(key));
  //     }
  //     resolve();
  //   });
  // }
}

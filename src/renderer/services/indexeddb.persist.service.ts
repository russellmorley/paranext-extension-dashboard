import { IPersist } from "src/types/persist.type";

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
      openRequest.onupgradeneeded = function(e) {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(instance.objectStore)) {
          db.createObjectStore(instance.objectStore, { keyPath: 'storeKey' });
        }
        instance.db = db
        resolve();
      };
    });
  }

  get(key: string) : Promise<any[] | undefined> {
    return new Promise<any[] | undefined>((resolve, reject) => {
      // const value = localStorage.getItem(`${this.prefix}_${key}`);
      // if (value)
      //   resolve(JSON.parse(value));
      // else
      //   resolve(undefined);
      // });
      try {
        const itemsNotAdded: Array<string> = new Array<string>();

        if (typeof this.db === 'undefined') {
          reject('db not set');
        }
        const request = this.db!
          .transaction([this.objectStore], "readwrite")
          .objectStore(this.objectStore)
          .getKey(key);
        request.onsuccess = (event) => {
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

  set(key: string, items: any[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // localStorage.setItem(`${this.prefix}_${key}`, JSON.stringify(items));
      // resolve();
      try {
        if (typeof this.db === 'undefined') {
          reject('db not set');
        }
        const transaction = this.db!.transaction([this.objectStore], "readwrite");
        transaction.oncomplete = (event) => {
          resolve();
        };
        transaction.onerror = (event) => {
          reject(`Couldn\'t create transaction: ${JSON.stringify(event)}`);
        };

        const store = transaction.objectStore(this.objectStore);

        items.forEach((item) => {
          item.storeKey = key;
        });

        let request: IDBRequest<IDBValidKey>;
        try {
          const request = store.add({storeKey: key, items});
          request.onerror = (event) => {
            reject(`Couldn\'t add: ${JSON.stringify(event)}`);
          };
        } catch (ConstraintError) {
          const request = store.put({storeKey: key, items})
          request.onerror = (event) => {
            reject(`Couldn\'t put: ${JSON.stringify(event)}`);
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
        if (typeof this.db === 'undefined') {
          reject('db not set');
        }
        const request = this.db!
          .transaction([this.objectStore], "readwrite")
          .objectStore(this.objectStore)
          .delete(key);
        request.onsuccess = (event) => {
          resolve();
        }
        request.onerror = (error) => {
          reject(JSON.stringify(error));
        }

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

import { AsyncLock } from "src/shared/utils/async-lock";


export type SelectorInfo = {
  keyPrefix: string
};

export type KeysSelector<K, T> = (item: T) => K[];
export type GetKeysSelector<K, T> = (info: SelectorInfo, ...keyParts: Array<string>) => KeysSelector<K, T>;

type IMap<T> = {
  [key in string]: Array<T>;
};

export interface IPersist{
  get(key: string) : Promise<any[] | undefined>;
  /**
   * Replaces items already stored under key with items parameter.
   * @param key
   * @param items
   */
  set(key: string, items: any[]): Promise<void>;
  remove(key: string): Promise<void>;
  // clear(): Promise<void>;
}

export class CacheService<T> {
  private map: IMap<T> = {};
  private getKeysSelector: GetKeysSelector<string, T>;
  private persist: IPersist | undefined;
  private keepMapAndPersistInSyncLock = new AsyncLock();

  constructor(
    getKeysSelector: GetKeysSelector<string, T>,
    persist: IPersist | undefined,
  ){
    this.getKeysSelector = getKeysSelector;
    this.persist = persist;
  }

  /**
   * Replaces existing items under every unique key calculated
   * from items parameter with those provided.
   */
  set(
    info: SelectorInfo,
    items: Array<T>,
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.keepMapAndPersistInSyncLock.promise; //wait for the lock
        this.keepMapAndPersistInSyncLock.lock(); //once the lock is free, grab it.
        const updatedKeys = Array<string>();
        // const keysSelector = getKeysSelector(...putKeyParts);
        const keysSelector = this.getKeysSelector(info);
        items.forEach((item) => {
          const keys = keysSelector(item);
          if (keys.length != 1)
            throw new Error(`keySelector for no keyParts for item '${JSON.stringify(item)}' didn't return one key, instead returned '${keys}}'`);
          const key = keys[0];
          if (updatedKeys.indexOf(key) == -1) {
            updatedKeys.push(key);
            this.map[key] = new Array<T>(item);
          } else {
            this.map[key].push(item);
          }
        });
        if (this.persist)
          // need to use map rather than forEach() so promises returned and can
          // be awaited on before releasing lock. With forEach() unlock will happen
          // before forEach() callbacks have completed since it is not possible to
          // await the promises they return.
          // see https://stackoverflow.com/a/37576787 for additional info.
          await Promise.all(updatedKeys.map(async key =>
            await this.persist!.set(key, this.map[key])));
          // updatedKeys.forEach(async key =>
          //   await this.persist!.set(key, this.map[key]));
        this.keepMapAndPersistInSyncLock.unlock(); //unlock before resolving to avoid deadlocks
        resolve();
      } catch (e) { //catch and unlock so exceptions don't cause deadlock
        this.keepMapAndPersistInSyncLock.unlock();
        reject(JSON.stringify(e));
      }
    });
  }

  getByKey (key: string): Promise<Array<T> | undefined> {
    return new Promise<Array<T> | undefined>(async (resolve, reject) => {
      try {
        await this.keepMapAndPersistInSyncLock.promise; //wait for the lock
        this.keepMapAndPersistInSyncLock.lock(); //once the lock is free, grab it.
        if (this.persist && !this.map[key]) {
          const value = await this.persist!.get(key);
          if (value)
          this.map[key] = value;
        }
        const res = this.map[key];
        this.keepMapAndPersistInSyncLock.unlock();//unlock before resolving to avoid deadlocks
        resolve(res);
      } catch (e) { //catch and unlock so exceptions don't cause deadlock
        this.keepMapAndPersistInSyncLock.unlock();
        reject(JSON.stringify(e));
      }
    });
  }

  removeByKey (key: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.keepMapAndPersistInSyncLock.promise; //wait for the lock
        this.keepMapAndPersistInSyncLock.lock(); //once the lock is free, grab it.
        delete this.map[key];
        await this.persist?.remove(key);
        this.keepMapAndPersistInSyncLock.unlock(); //unlock before resolving to avoid deadlocks
        resolve();
      } catch (e) { //catch and unlock so exceptions don't cause deadlock
        this.keepMapAndPersistInSyncLock.unlock();
        reject(JSON.stringify(e));
      }
    });
  }

  async get<U=T> (
    info: SelectorInfo,
    keyValueParts: T
  ): Promise<Array<T> | undefined>{
    const keys = this.getKeysSelector(
      info,
      ...Object.entries(keyValueParts as {}).map(([key, _]) => key)
    )(keyValueParts);
    console.log(JSON.stringify(keys));
    console.log(JSON.stringify(this.map));
    const instance = this;
    let ret = await keys.reduce<Promise<Array<T>>>(async (accumulator, key) => {
      const valuesForKey = await instance.getByKey(key);
      console.log(`valuesForKey ${valuesForKey}`);
      if (valuesForKey) {
        console.log(`in reducer with ${accumulator} and ${key}: concatenating`);
        (await accumulator).push(...valuesForKey);
        return accumulator;
      } else {
        console.log(`in reducer with ${accumulator} and ${key}: NOT concatenating`);
        return accumulator;
      }
    }, new Promise<Array<T>>((resolve) => resolve(new Array<T>())));
    if (ret.length === 0) {
      console.log('returning undefined');
      return undefined;
    } else {
      console.log('returning promise');
      return ret;
    }
  }

  remove (info: SelectorInfo, keyValueParts: T): Promise<void> {
    return new Promise<void>((resolve) => {
      const keys = this.getKeysSelector(
        info,
        ...Object.entries(keyValueParts as {}).map(([key, value]) => key)
      )(keyValueParts);
      keys.forEach(key => this.removeByKey(key));
      resolve();
    });
  }

  // clear(key: any | undefined): Promise<void> {
  //   return new Promise(async (resolve) => {
  //     this.map = {};
  //     await this.cache?.clear();
  //     resolve();
  //   });
  // }
}

// /**
//  *
//  * @param prefix
//  * @param token if undefined, use localStorage, else use ExtensionStorage.
//  * @returns
//  */
// export const StorageCache:  (prefix: string, token: ExecutionToken | undefined) => ICache =
//   (prefix: string, token: ExecutionToken | undefined) => {
//     if (token  !== undefined) {
//       return new ExtensionStorageCache(token, prefix);
//     } else
//       return new LocalStorageCache(prefix);
//     //}
//   };

import { IPersist } from 'src/types/persist.type';
import { Mutex } from 'platform-bible-utils';

export type SelectorInfo = {
  keyPrefix: string;
  valuesType: string;
};

export type KeysSelector<K, T> = (item: T) => K[];
export type GetKeysSelector<K, T> = (
  info: SelectorInfo,
  ...keyParts: Array<keyof T>
) => KeysSelector<K, T>;

type IMap<T> = {
  [key in string]: Array<T>;
};

export class CacheService<T extends object> {
  private map: IMap<T> = {};
  private getKeysSelector: GetKeysSelector<string, T>;
  private persist: IPersist | undefined;
  private keepMapAndPersistInSyncMutex = new Mutex();

  constructor(getKeysSelector: GetKeysSelector<string, T>, persist: IPersist | undefined) {
    this.getKeysSelector = getKeysSelector;
    this.persist = persist;
  }

  /**
   * Replaces existing items under every unique key calculated
   * from items parameter with those provided.
   */
  async set(info: SelectorInfo, items: Array<T>): Promise<void> {
    await this.keepMapAndPersistInSyncMutex.runExclusive(async () => {
      const updatedKeys: string[] = [];
      // const keysSelector = getKeysSelector(...putKeyParts);
      const keysSelector = this.getKeysSelector(info);
      items.forEach((item) => {
        const keys = keysSelector(item);
        if (keys.length !== 1)
          throw new Error(
            `keySelector for no keyParts for item '${JSON.stringify(item)}' didn't return one key, instead returned '${keys}}'`,
          );
        const key = keys[0];
        if (updatedKeys.indexOf(key) === -1) {
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
        // eslint-disable-next-line no-type-assertion/no-type-assertion
        await Promise.all(updatedKeys.map(async (key) => this.persist!.set(key, this.map[key])));
    });
  }

  async getByKey(key: string): Promise<Array<T> | undefined> {
    return this.keepMapAndPersistInSyncMutex.runExclusive(async () => {
      if (this.persist && !this.map[key]) {
        const value = await this.persist.get(key);
        if (value) this.map[key] = value;
      }
      return this.map[key];
    });
  }

  async removeByKey(key: string): Promise<void> {
    await this.keepMapAndPersistInSyncMutex.runExclusive(async () => {
      delete this.map[key];
      await this.persist?.remove(key);
    });
  }

  async get(info: SelectorInfo, keyValueParts: T): Promise<Array<T> | undefined> {
    const keys = this.getKeysSelector(
      info,
      // TS doesn't understand that `entries` gives us keys instead of strings
      // eslint-disable-next-line no-type-assertion/no-type-assertion
      ...Object.entries(keyValueParts).map(([key]) => key as keyof T),
    )(keyValueParts);
    console.debug(JSON.stringify(keys));
    console.debug(JSON.stringify(this.map));
    const instance = this;
    const ret = await keys.reduce<Promise<Array<T>>>(
      async (accumulator, key) => {
        const valuesForKey = await instance.getByKey(key);
        console.debug(`valuesForKey ${valuesForKey} key: ${key}`);
        if (valuesForKey) {
          console.debug(`in reducer with ${accumulator} and ${key}: concatenating`);
          (await accumulator).push(...valuesForKey);
          return accumulator;
        }
        console.debug(`in reducer with ${accumulator} and ${key}: NOT concatenating`);
        return accumulator;
      },
      new Promise<Array<T>>((resolve) => {
        resolve([]);
      }),
    );
    if (ret.length === 0) {
      console.debug('returning undefined');
      return undefined;
    }
    console.debug('returning promise');
    return ret;
  }

  remove(info: SelectorInfo, keyValueParts: T): Promise<void> {
    return new Promise<void>((resolve) => {
      const keys = this.getKeysSelector(
        info,
        // TS doesn't understand that `entries` gives us keys instead of strings
        // eslint-disable-next-line no-type-assertion/no-type-assertion
        ...Object.entries(keyValueParts).map(([key]) => key as keyof T),
      )(keyValueParts);
      keys.forEach((key) => this.removeByKey(key));
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

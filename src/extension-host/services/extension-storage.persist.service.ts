import { ExecutionToken } from '@papi/core';
import { storage } from '@papi/backend';
import { IPersist } from 'src/types/persist.type';

export class ExtensionStoragePersist implements IPersist {
  token: ExecutionToken;
  prefix: string;

  constructor(token: ExecutionToken, prefix: string) {
    this.token = token;
    this.prefix = prefix;
  }

  // TODO: Pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(key: string): Promise<any[] | undefined> {
    try {
      const str = await storage.readUserData(this.token, `${this.prefix}_${key}`);
      return JSON.parse(str);
    } catch {
      return undefined;
    }
  }

  // TODO: Pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, items: any[]): Promise<void> {
    try {
      await storage.writeUserData(this.token, `${this.prefix}_${key}`, JSON.stringify(items));
    } catch (e) {
      throw new Error(`Could not set due to error '${JSON.stringify(e)}'`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await storage.deleteUserData(this.token, `${this.prefix}_${key}`);
    } catch (e) {
      throw new Error(`Could not remove due to error '${JSON.stringify(e)}'`);
    }
  }
}

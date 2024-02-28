import { ExecutionToken } from "@papi/core";
import { IPersist } from "src/shared/services/cache.service";
import {storage} from "@papi/backend";

export class ExtensionStoragePersist implements IPersist {
  token: ExecutionToken;
  prefix: string;

  constructor(token: ExecutionToken, prefix: string) {
    this.token = token;
    this.prefix = prefix;
  }
  async get(key: string): Promise<any[] | undefined> {
    try {
      const str = await storage.readUserData(this.token, `${this.prefix}_${key}`);
      return JSON.parse(str);
    } catch {
      return undefined;
    }
  }
  async set(key: string, items: any[]): Promise<void> {
    try {
      await  storage.writeUserData(this.token, `${this.prefix}_${key}`, JSON.stringify(items));
    } catch(e) {
      throw new Error(`Could not set due to error '${JSON.stringify(e)}'`);
    }
  }
  async remove(key: string): Promise<void> {
    try {
      await storage.deleteUserData(this.token, `${this.prefix}_${key}`);
    } catch(e) {
      throw new Error(`Could not remove due to error '${JSON.stringify(e)}'`);
    }
  }
}

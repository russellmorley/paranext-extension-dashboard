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

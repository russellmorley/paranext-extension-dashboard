export interface IPersist {
  // TODO: Pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string): Promise<any[] | undefined>;
  /**
   * Replaces items already stored under key with items parameter.
   * @param key
   * @param items
   */
  // TODO: Pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, items: any[]): Promise<void>;
  remove(key: string): Promise<void>;
  // clear(): Promise<void>;
}

declare global {
  interface Array<T> {
    groupBy<K extends keyof T>(key: K): { [key: string]: T[] };
    groupBySelector(selector: (element: T) => string | undefined): { [key: string]: T[] };
  }
}

export const groupBy = <T, K extends keyof T>(array: T[], key: K): { [key: string]: T[] } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return array.reduce((accumulator: any, currentValue: T) => {
    const group = currentValue[key];
    if (!accumulator[group]) {
      accumulator[group] = [];
    }
    accumulator[group].push(currentValue);
    return accumulator;
  }, {});
};

export const groupBySelector = <T>(
  array: T[],
  selector: (element: T) => string | undefined,
): { [key: string]: T[] } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return array.reduce((accumulator: any, currentValue: T) => {
    const group = selector(currentValue);
    if (group === undefined) return accumulator;
    if (!accumulator[group]) {
      accumulator[group] = [];
    }
    accumulator[group].push(currentValue);
    return accumulator;
  }, {});
};

if (!Array.prototype.groupBy) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.groupBy = <T, K extends keyof T>(key: K): { [key: string]: T[] } => {
    // eslint-disable-next-line no-type-assertion/no-type-assertion
    return groupBy(this as unknown as T[], key);
  };
}

if (!Array.prototype.groupBySelector) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.groupBySelector = <T>(
    selector: (element: T) => string | undefined,
  ): {
    [key: string]: T[];
  } => {
    // eslint-disable-next-line no-type-assertion/no-type-assertion
    return groupBySelector(this as unknown as T[], selector);
  };
}

export {};

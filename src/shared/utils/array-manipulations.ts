declare global {
  interface Array<T> {
      groupBy<K extends keyof T>(key: K): { [key: string]: T[] };
      groupBySelector(selector: (element: T) => string | undefined): { [key: string]: T[] };
  }
}

export const groupBy = function <T, K extends keyof T>(array: T[], key: K): { [key: string]: T[] } {
  return array.reduce((accumulator: any, currentValue: T) => {
    const group = currentValue[key];
    if (!accumulator[group]) {
      accumulator[group] = [];
    }
    accumulator[group].push(currentValue);
    return accumulator;
  }, {});
}

export const groupBySelector = function <T>(array: T[], selector: (element: T) => string | undefined): { [key: string]: T[] } {
  return array.reduce((accumulator: any, currentValue: T) => {
    const group = selector(currentValue);
    if (group === undefined)
      return accumulator;
    if (!accumulator[group]) {
      accumulator[group] = [];
    }
    accumulator[group].push(currentValue);
    return accumulator;
  }, {});
}

if (!Array.prototype.groupBy)  {
  Array.prototype.groupBy = function <T, K extends keyof T>(key: K): { [key: string]: T[] } {
    return groupBy(this, key);
  }
}

if (!Array.prototype.groupBySelector) {
  Array.prototype.groupBySelector = function <T>(selector: (element: T) => string | undefined): { [key: string]: T[] } {
    return groupBySelector(this, selector);
  }
}

export {};

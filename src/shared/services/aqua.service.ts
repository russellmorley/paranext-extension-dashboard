/* eslint-disable no-underscore-dangle */

import { CacheService, KeysSelector, SelectorInfo } from './cache.service';
import { VerseRef, Canon } from '@sillsdev/scripture';
import { Result, ResultsSelector } from 'paranext-extension-dashboard';
import { AsyncLock } from '../utils/async-lock.util';
import { Requester } from '../../types/requester.type';
import { IPersist } from 'src/types/persist.type';


// If relying on headers, see https://stackoverflow.com/a/45640164, https://web.dev/articles/introduction-to-fetch#response_types

export interface IAquaService {
  getResults({assessment_id, book}: ResultsSelector): Promise<Result[]>;
}

export class AquaService implements IAquaService {
  // endpoints
  private readonly version: string = 'version';
  private readonly language: string = 'language';
  private readonly script: string = 'script';

  private readonly revision: string = 'revision';
  private readonly assessment: string = 'assessment';
  private readonly result: string = 'result';

  // configuration
  private baseUri: string;
  private _paramsToInclude: Record<string, any>;
  private _requester: Requester;
  private cacheService: CacheService<Result> | undefined;
  private keepGetAndSetCacheInSyncLock = new AsyncLock();

  constructor(
    baseUri: string,
     paramsToInclude: Record<string, any>,
     requester: Requester,
     persist: IPersist | undefined = undefined) {
    this.baseUri = baseUri;
    this._paramsToInclude = paramsToInclude;
    this._requester = requester;

    this.cacheService = new CacheService<Result>(
      (info: SelectorInfo, ...keyParts: Array<string>): KeysSelector<string, Result> => {
        if (keyParts.length > 0 && keyParts[0] !== 'assessment_id')
          throw new Error("First keyPart must be included and be 'assessment_id'");
        if (keyParts.length > 1 && keyParts[1] !== 'vref')
          throw new Error("If included, second keyPart must be 'vref'");
        if (keyParts.length > 2)
          throw new Error("Must have keyParts 'assessment_id' and at most additionally, but optionally, 'vref'");
        if (keyParts.length == 0)
          keyParts.push("assessment_id", 'vref');
        return (item: Result) => {
          //IF can't obtain key parts, raise Error
          keyParts
            .forEach(keyPart => {
              if (item[keyPart as keyof Result] === undefined)
                throw new Error(`Item '${JSON.stringify(item)}' does not contain property '${keyPart}'`);
            });
          if (keyParts.length == 2) {
            let keyPartOne: string = item[keyParts[1] as keyof Result] as string;
            if (keyPartOne.length > 3)
              keyPartOne = new VerseRef(keyPartOne).book;
            return [
              `${info.keyPrefix}_${item[keyParts[0] as keyof Result] as string}__${keyPartOne}__Results`
            ];
          } else {
            return Canon.allBookIds.map(book =>
              `${info.keyPrefix}_${item[keyParts[0] as keyof Result] as string}__${book}__Results`
            );
          }
        };
      },
      persist);
  }

  get uri() {
    return this.baseUri;
  }

  set uri(value) {
    this.baseUri = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get paramsToInclude() {
    return this._paramsToInclude;
  }

  set paramsToInclude(value) {
    this._paramsToInclude = value;
  }

  get requester() {
    return this._requester;
  }

  set requester(value) {
    this._requester = value;
  }

  async getResults({assessment_id, book}: ResultsSelector): Promise<Result[]> {
    try {
      await this.keepGetAndSetCacheInSyncLock.promise; //wait for the lock
      this.keepGetAndSetCacheInSyncLock.lock(); //once the lock is free, grab it.

      let results: Result [] | undefined;
      const info = {keyPrefix: 'assessment', valuesType: 'verseresults'} as SelectorInfo;
      if (this.cacheService) {
        if (book)
          results = await this.cacheService.get(
            info,
            {assessment_id: assessment_id, vref: book.toString()} as Result)
        else {
          results = await this.cacheService.get(
            info,
            {assessment_id: assessment_id} as Result);
        }
      }
      if (!results) {
        if (book)
          results = (await this._requester<{results: Result[]}>(
            `${this.baseUri}/${this.result}?assessment_id=${assessment_id}&book=${book}`,
            this.paramsToInclude,
          )).results;
        else
          results = (await this._requester<{results: Result[]}>(
            `${this.baseUri}/${this.result}?assessment_id=${assessment_id}`,
            this.paramsToInclude,
          )).results;
        await this.cacheService?.set(
          info,
          results);
      }
      return results;
    } finally {
      this.keepGetAndSetCacheInSyncLock.unlock();
    }
  }
}

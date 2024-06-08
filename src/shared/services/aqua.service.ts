import { IPersist } from 'src/types/persist.type';
import { VerseRef, Canon } from '@sillsdev/scripture';
import type { Result, Results, ResultsSelector } from 'paranext-extension-dashboard';
import { Mutex } from 'platform-bible-utils';
import { CacheService, KeysSelector, SelectorInfo } from './cache.service';
import { Requester } from '../../types/requester.type';

// If relying on headers, see https://stackoverflow.com/a/45640164, https://web.dev/articles/introduction-to-fetch#response_types

export interface IAquaService {
  /**
   *
   * @param param0
   * @returns both the results and a string id which is different than for any other set of results
   */
  getResults({ assessmentId, book, aggregateByChapter }: ResultsSelector): Promise<Results>;
}

export class AquaService implements IAquaService {
  // endpoints
  /*
  private readonly version: string = 'version';
  private readonly language: string = 'language';
  private readonly script: string = 'script';

  private readonly revision: string = 'revision';
  private readonly assessment: string = 'assessment';
  */
  private readonly result: string = 'result';

  // configuration
  private baseUri: string;
  // TODO: pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private paramsToIncludeInternal: Record<string, any>;
  private requesterInternal: Requester;
  private cacheService: CacheService<Result> | undefined;
  private keepGetAndSetCacheInSyncLock = new Mutex();

  constructor(
    baseUri: string,
    // TODO: pick a better type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paramsToInclude: Record<string, any>,
    requester: Requester,
    persist: IPersist | undefined = undefined,
  ) {
    this.baseUri = baseUri;
    this.paramsToIncludeInternal = paramsToInclude;
    this.requesterInternal = requester;

    this.cacheService = new CacheService<Result>(
      (info: SelectorInfo, ...keyParts: Array<keyof Result>): KeysSelector<string, Result> => {
        if (keyParts.length > 0 && keyParts[0] !== 'assessmentId')
          throw new Error("First keyPart must be included and be 'assessment_id'");
        if (keyParts.length > 1 && keyParts[1] !== 'vref')
          throw new Error("If included, second keyPart must be 'vref'");
        if (keyParts.length > 2)
          throw new Error(
            "Must have keyParts 'assessment_id' and at most additionally, but optionally, 'vref'",
          );
        if (keyParts.length === 0) keyParts.push('assessmentId', 'vref');
        return (item: Result) => {
          // IF can't obtain key parts, raise Error
          keyParts.forEach((keyPart) => {
            // Verifying that all of the keyParts contain data
            // eslint-disable-next-line no-type-assertion/no-type-assertion
            if (item[keyPart as keyof Result] === undefined)
              throw new Error(
                `Item '${JSON.stringify(item)}' does not contain property '${keyPart}'`,
              );
          });
          if (keyParts.length === 2) {
            let keyPartOne: string = String(item[keyParts[1]]);
            if (keyPartOne.length > 3) {
              try {
                keyPartOne = new VerseRef(keyPartOne).book;
              } catch (e) {
                console.debug(
                  `Could not extract book using VerseRef from ${keyPartOne}: ${JSON.stringify(e)}. Trying split...`,
                );
                const parts = keyPartOne.split(' ');
                if (parts.length === 2) [keyPartOne] = parts;
                else {
                  const errorMessage = `Could not extract book using spit from ${keyPartOne}: ${JSON.stringify(e)}`;
                  console.error(`${errorMessage}. Throwing error.`);
                  throw new Error(errorMessage);
                }
              }
            }
            const retVal = `${info.keyPrefix}_${item[keyParts[0]]}__${keyPartOne}__${info.valuesType}`;
            console.debug(retVal);
            return [retVal];
          }
          return Canon.allBookIds.map(
            (book) => `${info.keyPrefix}_${item[keyParts[0]]}__${book}__${info.valuesType}`,
          );
        };
      },
      persist,
    );
  }

  get uri() {
    return this.baseUri;
  }

  set uri(value) {
    this.baseUri = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get paramsToInclude() {
    return this.paramsToIncludeInternal;
  }

  set paramsToInclude(value) {
    this.paramsToIncludeInternal = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get requester() {
    return this.requesterInternal;
  }

  set requester(value) {
    this.requesterInternal = value;
  }

  async getResults({ assessmentId, book, aggregateByChapter }: ResultsSelector): Promise<Results> {
    return this.keepGetAndSetCacheInSyncLock.runExclusive(async () => {
      let results: Result[] | undefined;
      const info: SelectorInfo = {
        keyPrefix: 'assessment',
        valuesType: aggregateByChapter ? 'chapterresults' : 'verseresults',
      };
      if (this.cacheService) {
        if (book)
          results = await this.cacheService.get(info, {
            assessmentId,
            vref: book.toString(),
          });
        else {
          results = await this.cacheService.get(info, { assessmentId });
        }
      }
      if (!results) {
        if (book)
          if (!aggregateByChapter)
            results = (
              await this.requesterInternal<{ results: Result[] }>(
                `${this.baseUri}/${this.result}?assessment_id=${assessmentId}&book=${book}&include_text=true`,
                this.paramsToInclude,
              )
            ).results;
          else
            results = (
              await this.requesterInternal<{ results: Result[] }>(
                `${this.baseUri}/${this.result}?assessment_id=${assessmentId}&book=${book}&aggregate=chapter`,
                this.paramsToInclude,
              )
            ).results;
        else if (!aggregateByChapter)
          results = (
            await this.requesterInternal<{ results: Result[] }>(
              `${this.baseUri}/${this.result}?assessment_id=${assessmentId}`,
              this.paramsToInclude,
            )
          ).results;
        else
          results = (
            await this.requesterInternal<{ results: Result[] }>(
              `${this.baseUri}/${this.result}?assessment_id=${assessmentId}&aggregate=chapter`,
              this.paramsToInclude,
            )
          ).results;
        await this.cacheService?.set(info, results);
      }
      return results;
    });
  }
}

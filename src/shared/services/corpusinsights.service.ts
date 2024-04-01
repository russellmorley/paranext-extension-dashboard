import { PaddedToken, Token, TokensTextRow } from "src/renderer/tokenstextrows.context"
import { Requester } from "src/types/requester.type";
import { CacheService, KeysSelector, SelectorInfo } from "./cache.service";
import { AsyncLock } from "../utils/async-lock.util";
import { IPersist } from "src/types/persist.type";

export class CorpusInsightsService {
  // endpoints
  private readonly tokensTextRows: string = 'tokenstextrows';

  // configuration
  private baseUri: string;
  private _paramsToInclude: Record<string, any>;
  private _requester: Requester;
  private cacheService: CacheService<TokensTextRow> | undefined;
  //private keepGetAndSetCacheInSyncLock = new AsyncLock();

  constructor(
    baseUri: string,
    paramsToInclude: Record<string, any>,
    requester: Requester,
    persist: IPersist | undefined = undefined) {
      this.baseUri = baseUri;
      this._paramsToInclude = paramsToInclude;
      this._requester = requester;
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

  async getByVerseRange(
    tokenizedTextCorpusId: string,
    verseRef: string,
    numberOfVersesInChapterBefore: number,
    numberOfVersesInChapterAfter: number): Promise<TokensTextRow[]> {
      try {
        let tokensTextRows: TokensTextRow[] = await new Promise<TokensTextRow[]>((resolve) => {
          const tokenTextRowsJson = `
          [
            {
              "ref": "GEN 1:1",
              "tokens": [
                {
                  "bookNumber": 1,
                  "chapterNumber": 1,
                  "verseNumber": 1,
                  "wordNumber": 1,
                  "subWordNumber": 1,
                  "position": 1,
                  "trainingText": "I",
                  "surfaceText": "I",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "bookNumber": 1,
                  "chapterNumber": 1,
                  "verseNumber": 1,
                  "wordNumber": 2,
                  "subWordNumber": 1,
                  "position": 2,
                  "trainingText": "am",
                  "surfaceText": "am",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "bookNumber": 1,
                  "chapterNumber": 1,
                  "verseNumber": 1,
                  "wordNumber": 3,
                  "subWordNumber": 1,
                  "position": 3,
                  "trainingText": "cool",
                  "surfaceText": "cool",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                }
             ]
            },
            {
              "ref": "GEN 1:2",
              "tokens": [
                {
                  "bookNumber": 1,
                  "chapterNumber": 1,
                  "verseNumber": 2,
                  "wordNumber": 1,
                  "subWordNumber": 1,
                  "position": 1,
                  "trainingText": "So",
                  "surfaceText": "So",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "bookNumber": 1,
                  "chapterNumber": 1,
                  "verseNumber": 2,
                  "wordNumber": 2,
                  "subWordNumber": 1,
                  "position": 2,
                  "trainingText": "are",
                  "surfaceText": "are",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "bookNumber": 1,
                  "chapterNumber": 1,
                  "verseNumber": 2,
                  "wordNumber": 3,
                  "subWordNumber": 1,
                  "position": 3,
                  "trainingText": "you",
                  "surfaceText": "you",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                }
             ]
            }
          ]`;
          resolve(JSON
            .parse(tokenTextRowsJson)
              .map((tokensTextRowObject: { ref: any; tokens: { bookNumber: any; chapterNumber: any; verseNumber: any; wordNumber: any; subWordNumber: any; position: any; trainingText: any; surfaceText: any; surfaceTextPrefix: any; surfaceTextSuffix: any; paddingBefore: any; paddingAfter: any; }[]; }) =>
                new TokensTextRow({ref: tokensTextRowObject.ref, tokens: tokensTextRowObject.tokens
                  .map((tokenObject: { bookNumber: any; chapterNumber: any; verseNumber: any; wordNumber: any; subWordNumber: any; position: any; trainingText: any; surfaceText: any; surfaceTextPrefix: any; surfaceTextSuffix: any; paddingBefore: any; paddingAfter: any; }) =>
                    new PaddedToken(tokenObject)
                  )
                })
              ));
        });
        // await this._requester<TokensTextRow[]>(
        //   `${this.baseUri}/${this.tokensTextRows}?tokenizedTextCorpusId=${tokenizedtextcorpus_id}&verseref=${verseRef}&versesbeforenumber=${}&versesafternumber=${numberOfVersesInChapterAfter}`,
        //   this.paramsToInclude);
        return tokensTextRows;
      } finally {
      }
   }
}

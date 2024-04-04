import { PaddedToken, Token, TokensTextRow, TokensTextRowsInfo } from "src/renderer/tokenstextrows.context"
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
    tokenizedTextCorpusName: string,
    verseRef: string,
    numberOfVersesInChapterBefore: number,
    numberOfVersesInChapterAfter: number): Promise<TokensTextRowsInfo> {
      try {
        let tokensTextRows: TokensTextRow[] = await new Promise<TokensTextRow[]>((resolve) => {
          const tokenTextRowsJson = `
          [
            {
              "ref": "GEN 1:1",
              "tokens": [
                {
                  "tokenId": {
                    "bookNumber": 1,
                    "chapterNumber": 1,
                    "verseNumber": 1,
                    "wordNumber": 1,
                    "subWordNumber": 1 },
                  "position": 1,
                  "trainingText": "I",
                  "surfaceText": "I",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "tokenId": {
                    "bookNumber": 1,
                    "chapterNumber": 1,
                    "verseNumber": 1,
                    "wordNumber": 2,
                    "subWordNumber": 1 },
                  "position": 2,
                  "trainingText": "am",
                  "surfaceText": "am",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "tokenId": {
                    "bookNumber": 1,
                    "chapterNumber": 1,
                    "verseNumber": 1,
                    "wordNumber": 3,
                    "subWordNumber": 1 },
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
                  "tokenId": {
                    "bookNumber": 1,
                    "chapterNumber": 1,
                    "verseNumber": 2,
                    "wordNumber": 1,
                    "subWordNumber": 1 },
                  "position": 1,
                  "trainingText": "So",
                  "surfaceText": "So",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "tokenId": {
                    "bookNumber": 1,
                    "chapterNumber": 1,
                    "verseNumber": 2,
                    "wordNumber": 2,
                    "subWordNumber": 1 },
                  "position": 2,
                  "trainingText": "are",
                  "surfaceText": "are",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                },
                {
                  "tokenId": {
                    "bookNumber": 1,
                    "chapterNumber": 1,
                    "verseNumber": 2,
                    "wordNumber": 3,
                    "subWordNumber": 1 },
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
              .map((tokensTextRowObject: { ref: any; tokens: { tokenId: { bookNumber: number; chapterNumber: number; verseNumber: number; wordNumber: number; subWordNumber: number; }; surfaceText: string; trainingText: string; position: number; surfaceTextPrefix: string; surfaceTextSuffix: string; paddingBefore: string; paddingAfter: string; }[]; }) =>
                new TokensTextRow({ref: tokensTextRowObject.ref, tokens: tokensTextRowObject.tokens
                  .map((tokenObject: { tokenId: { bookNumber: number; chapterNumber: number; verseNumber: number; wordNumber: number; subWordNumber: number; }; surfaceText: string; trainingText: string; position: number; surfaceTextPrefix: string; surfaceTextSuffix: string; paddingBefore: string; paddingAfter: string; }) =>
                    new PaddedToken(tokenObject)
                  )
                })
              ));
        });
        // await this._requester<TokensTextRow[]>(
        //   `${this.baseUri}/${this.tokensTextRows}?tokenizedTextCorpusId=${tokenizedtextcorpus_id}&verseref=${verseRef}&versesbeforenumber=${}&versesafternumber=${numberOfVersesInChapterAfter}`,
        //   this.paramsToInclude);
        return {
          corpusId: tokenizedTextCorpusId,
          corpusName: tokenizedTextCorpusName? tokenizedTextCorpusName : '<corpus name not set',
          tokensTextRows: tokensTextRows};
      } finally {
      }
   }
}

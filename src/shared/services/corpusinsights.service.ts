import {
  PaddedToken,
  TokensTextRow,
  TokensTextRowsInfo,
} from 'src/renderer/tokenstextrows.context';
import { Requester } from 'src/types/requester.type';
// import { IPersist } from 'src/types/persist.type';
// import { CacheService } from './cache.service';

export class CorpusInsightsService {
  // endpoints
  // private readonly tokensTextRows: string = 'tokenstextrows';

  // configuration
  private baseUri: string;
  // TODO: Pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private paramsToIncludeInternal: Record<string, any>;
  private requesterInternal: Requester;
  // private cacheService: CacheService<TokensTextRow> | undefined;

  constructor(
    baseUri: string,
    // TODO: Pick a better type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paramsToInclude: Record<string, any>,
    requester: Requester,
    // persist: IPersist | undefined = undefined,
  ) {
    this.baseUri = baseUri;
    this.paramsToIncludeInternal = paramsToInclude;
    this.requesterInternal = requester;
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

  // eslint-disable-next-line class-methods-use-this
  async getByVerseRange(
    tokenizedTextCorpusId: string,
    tokenizedTextCorpusName: string,
    // verseRef: string,
    // numberOfVersesInChapterBefore: number,
    // numberOfVersesInChapterAfter: number,
  ): Promise<TokensTextRowsInfo> {
    const tokensTextRows: TokensTextRow[] = await new Promise<TokensTextRow[]>((resolve) => {
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
                    "wordNumber": 3,
                    "subWordNumber": 1 },
                  "position": 2,
                  "trainingText": "اليَوْمُ",
                  "surfaceText": "اليَوْمُ",
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
                  "trainingText": "الأوَّلُ",
                  "surfaceText": "الأوَّلُ",
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
                    "wordNumber": 1,
                    "subWordNumber": 1 },
                  "position": 1,
                  "trainingText": "النُّور",
                  "surfaceText": "النُّور",
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
                    "wordNumber": 3,
                    "subWordNumber": 1 },
                  "position": 3,
                  "trainingText": "كَانَتِ",
                  "surfaceText": "كَانَتِ",
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
                  "trainingText": "الأرْضُ",
                  "surfaceText": "الأرْضُ",
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
                    "wordNumber": 1,
                    "subWordNumber": 1 },
                  "position": 1,
                  "trainingText": "قَاحِلَةً",
                  "surfaceText": "قَاحِلَةً",
                  "surfaceTextPrefix": "",
                  "surfaceTextSuffix": "",
                  "paddingBefore": "",
                  "paddingAfter": " "
                }
             ]
            }
          ]`;
      resolve(
        JSON.parse(tokenTextRowsJson).map(
          (tokensTextRowObject: {
            // TODO: Pick a better type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref: any;
            tokens: {
              tokenId: {
                bookNumber: number;
                chapterNumber: number;
                verseNumber: number;
                wordNumber: number;
                subWordNumber: number;
              };
              surfaceText: string;
              trainingText: string;
              position: number;
              surfaceTextPrefix: string;
              surfaceTextSuffix: string;
              paddingBefore: string;
              paddingAfter: string;
            }[];
          }) =>
            new TokensTextRow({
              ref: tokensTextRowObject.ref,
              tokens: tokensTextRowObject.tokens.map(
                (tokenObject: {
                  tokenId: {
                    bookNumber: number;
                    chapterNumber: number;
                    verseNumber: number;
                    wordNumber: number;
                    subWordNumber: number;
                  };
                  surfaceText: string;
                  trainingText: string;
                  position: number;
                  surfaceTextPrefix: string;
                  surfaceTextSuffix: string;
                  paddingBefore: string;
                  paddingAfter: string;
                }) => new PaddedToken(tokenObject),
              ),
            }),
        ),
      );
    });
    // await this._requester<TokensTextRow[]>(
    //   `${this.baseUri}/${this.tokensTextRows}?tokenizedTextCorpusId=${tokenizedtextcorpus_id}&verseref=${verseRef}&versesbeforenumber=${}&versesafternumber=${numberOfVersesInChapterAfter}`,
    //   this.paramsToInclude);
    return {
      corpusId: tokenizedTextCorpusId,
      corpusName: tokenizedTextCorpusName || '<corpus name not set',
      tokensTextRows,
    };
  }
}

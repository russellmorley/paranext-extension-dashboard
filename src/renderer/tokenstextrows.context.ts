/* eslint-disable max-classes-per-file */
import { createContext } from 'react';

export class TokenId {
  protected bookNumberInternal: number;
  protected chapterNumberInternal: number;
  protected verseNumberInternal: number;
  protected wordNumberInternal: number;
  protected subWordNumberInternal: number;

  constructor(
    bookNumber: number,
    chapterNumber: number,
    verseNumber: number,
    wordNumber: number,
    subWordNumber: number,
  ) {
    this.bookNumberInternal = bookNumber;
    this.chapterNumberInternal = chapterNumber;
    this.verseNumberInternal = verseNumber;
    this.wordNumberInternal = wordNumber;
    this.subWordNumberInternal = subWordNumber;
  }

  get bookNumber(): number {
    return this.bookNumberInternal;
  }

  get chapterNumber(): number {
    return this.chapterNumberInternal;
  }

  get verseNumber(): number {
    return this.verseNumberInternal;
  }

  get wordNumber(): number {
    return this.wordNumberInternal;
  }

  get subWordNumber(): number {
    return this.subWordNumberInternal;
  }

  toString = () =>
    `${`00000${this.bookNumberInternal}`.slice(-3)}${`00000${this.chapterNumberInternal}`.slice(-3)}${`00000${this.verseNumberInternal}`.slice(-3)}${`00000${this.wordNumberInternal}`.slice(-3)}${`00000${this.subWordNumberInternal}`.slice(-3)}`;
}

export class Token {
  protected tokenIdInternal: TokenId;
  protected positionInternal: number;
  protected trainingTextInternal: string = '';
  protected surfaceTextInternal: string = '';
  protected surfaceTextPrefixInternal: string = '';
  protected surfaceTextSuffixInternal: string = '';

  constructor(
    tokenId: TokenId,
    surfaceText: string,
    trainingText: string,
    position: number,
    surfaceTextPrefix: string,
    surfaceTextSuffix: string,
  ) {
    this.tokenIdInternal = tokenId;
    this.surfaceTextInternal = surfaceText;
    this.trainingTextInternal = trainingText;
    this.positionInternal = position;
    this.surfaceTextPrefixInternal = surfaceTextPrefix;
    this.surfaceTextSuffixInternal = surfaceTextSuffix;
  }

  get tokenId() {
    return this.tokenIdInternal;
  }

  get position() {
    return this.positionInternal;
  }

  get trainingText() {
    return this.trainingTextInternal;
  }

  get surfaceText() {
    return this.surfaceTextInternal;
  }

  get surfaceTextPrefix() {
    return this.surfaceTextPrefixInternal;
  }

  get surfaceTextSuffix() {
    return this.surfaceTextSuffixInternal;
  }

  // eslint-disable-next-line class-methods-use-this
  get paddingBefore() {
    return '';
  }

  // eslint-disable-next-line class-methods-use-this
  get paddingAfter() {
    return '';
  }

  toString = (): string =>
    `${this.surfaceTextPrefixInternal}${this.surfaceTextInternal}${this.surfaceTextSuffixInternal}`;
}

export class PaddedToken extends Token {
  paddingBeforeInternal: string;
  paddingAfterInternal: string;

  constructor(paddedToken: {
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
  }) {
    super(
      new TokenId(
        paddedToken.tokenId.bookNumber,
        paddedToken.tokenId.chapterNumber,
        paddedToken.tokenId.verseNumber,
        paddedToken.tokenId.wordNumber,
        paddedToken.tokenId.subWordNumber,
      ),
      paddedToken.surfaceText,
      paddedToken.trainingText,
      paddedToken.position,
      paddedToken.surfaceTextPrefix,
      paddedToken.surfaceTextSuffix,
    );
    this.paddingBeforeInternal = paddedToken.paddingBefore;
    this.paddingAfterInternal = paddedToken.paddingAfter;
  }

  get paddingBefore() {
    return this.paddingBeforeInternal;
  }

  get paddingAfter() {
    return this.paddingAfterInternal;
  }
}

export class TokensTextRow {
  refInternal: string;
  tokensInternal: Token[];

  constructor(tokensTextRow: { ref: string; tokens: Token[] }) {
    this.refInternal = tokensTextRow.ref;
    this.tokensInternal = tokensTextRow.tokens;
  }

  get ref() {
    return this.refInternal;
  }

  get tokens() {
    return this.tokensInternal;
  }
}

export type TokensTextRowsInfo = {
  corpusId: string;
  corpusName: string;
  tokensTextRows: TokensTextRow[];
};

export const TokensTextRowsInfoContext = createContext<TokensTextRowsInfo>({
  corpusId: '',
  corpusName: '',
  tokensTextRows: [],
});

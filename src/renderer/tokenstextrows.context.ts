import { createContext } from 'react';

export class TokenId {
  protected _bookNumber:number;
  protected _chapterNumber: number;
  protected _verseNumber: number;
  protected _wordNumber: number;
  protected _subWordNumber: number;

  get bookNumber(): number {
    return this._bookNumber;
  }

  get chapterNumber(): number {
    return this._chapterNumber;
  }
  get verseNumber(): number {
    return this._verseNumber;
  }
  get wordNumber(): number {
    return this._wordNumber;
  }
  get subWordNumber(): number {
    return this._subWordNumber;
  }

  constructor(
    bookNumber: number,
    chapterNumber: number,
    verseNumber: number,
    wordNumber: number,
    subWordNumber: number)
  {
      this._bookNumber = bookNumber;
      this._chapterNumber = chapterNumber;
      this._verseNumber = verseNumber;
      this._wordNumber = wordNumber;
      this._subWordNumber = subWordNumber;
  }

  toString = () =>
    `${('00000' + this._bookNumber.toString()).slice(-3)}${('00000' + this._chapterNumber.toString()).slice(-3)}${('00000' + this._verseNumber.toString()).slice(-3)}${('00000' + this._wordNumber.toString()).slice(-3)}${('00000' + this._subWordNumber.toString()).slice(-3)}`;
}

export class Token {
  protected _tokenId: TokenId;
  protected _position: number;
  protected _trainingText: string = "";
  protected _surfaceText: string = "";
  protected _surfaceTextPrefix: string  = "";
  protected _surfaceTextSuffix: string = "";

  get tokenId() {
    return this._tokenId;
  }
  get position() {
    return this._position;
  }

  get trainingText() {
    return this._trainingText;
  }

  get surfaceText() {
    return this._surfaceText;
  }

  get surfaceTextPrefix() {
    return this._surfaceTextPrefix;
  }

  get surfaceTextSuffix() {
    return this._surfaceTextSuffix;
  }

  get paddingBefore() {
    return '';
  }
  get paddingAfter() {
    return '';
  }

  constructor(
    tokenId: TokenId,
    surfaceText: string,
    trainingText: string,
    position: number,
    surfaceTextPrefix: string,
    surfaceTextSuffix: string) {
    this._tokenId = tokenId;
    this._surfaceText = surfaceText;
    this._trainingText = trainingText;
    this._position = position;
    this._surfaceTextPrefix = surfaceTextPrefix;
    this._surfaceTextSuffix = surfaceTextSuffix;
  }

  toString = (): string => `${this._surfaceTextPrefix}${this._surfaceText}${this._surfaceTextSuffix}`;
}

export class PaddedToken extends Token {
  _paddingBefore: string;
  _paddingAfter: string;

  constructor(paddedToken: {
    tokenId: {
      bookNumber: number,
      chapterNumber: number,
      verseNumber: number,
      wordNumber: number,
      subWordNumber: number},
    surfaceText: string,
    trainingText: string,
    position: number,
    surfaceTextPrefix: string,
    surfaceTextSuffix: string,
    paddingBefore: string,
    paddingAfter: string}) {
  super(
    new TokenId(
      paddedToken.tokenId.bookNumber,
      paddedToken.tokenId.chapterNumber,
      paddedToken.tokenId.verseNumber,
      paddedToken.tokenId.wordNumber,
      paddedToken.tokenId.subWordNumber),
    paddedToken.surfaceText,
    paddedToken.trainingText,
    paddedToken.position,
    paddedToken.surfaceTextPrefix,
    paddedToken.surfaceTextSuffix);
    this._paddingBefore = paddedToken.paddingBefore;
    this._paddingAfter = paddedToken.paddingAfter;
  }

  get paddingBefore() {
    return this._paddingBefore;
  }
  get paddingAfter() {
    return this._paddingAfter;
  }
}

export class TokensTextRow {
  _ref: string;
  _tokens: Token[];

  constructor(tokensTextRow: {ref: string, tokens: Token[]}) {
    this._ref = tokensTextRow.ref;
    this._tokens = tokensTextRow.tokens;
  }

 get ref() {
    return this._ref;
  }

  get tokens() {
    return this._tokens;
  }
}

export type TokensTextRowsInfo = {corpusId: string, corpusName: string, tokensTextRows: TokensTextRow[]};

export const TokensTextRowsInfoContext = createContext({} as TokensTextRowsInfo);

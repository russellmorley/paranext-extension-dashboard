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

  toString = () => `${('00000' + this._bookNumber.toString()).slice(-3)}${('00000' + this._chapterNumber.toString()).slice(-3)}${('00000' + this._verseNumber.toString()).slice(-3)}${('00000' + this._wordNumber.toString()).slice(-3)}${('00000' + this._subWordNumber.toString()).slice(-3)}`;
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

  constructor(tokenId: TokenId, surfaceText: string, trainingText: string, position: number) {
    this._tokenId = tokenId;
    this._surfaceText = surfaceText;
    this._trainingText = trainingText;
    this._position = position;
  }

  toString = (): string => `${this._surfaceTextPrefix}${this._surfaceText}${this._surfaceTextSuffix}`;
}


export type Verse = {verseRef: string, tokens: Token[]};

export const VersesContext = createContext([] as Verse[]);

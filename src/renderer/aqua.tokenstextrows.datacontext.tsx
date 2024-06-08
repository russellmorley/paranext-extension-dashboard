import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { VerseRef } from '@sillsdev/scripture';
import { PaddedToken, TokensTextRow, TokensTextRowsInfoContext } from './tokenstextrows.context';

export type VerseText = {
  verseRef: string;
  text: string;
};

export type AquaTokensTextRowsDataContextParams = {
  corpusId: string;
  corpusName: string;
  verseTexts: VerseText[];
};

export function AquaTokenTextRowsDataContext({
  children,
  corpusId,
  corpusName,
  verseTexts,
}: PropsWithChildren<AquaTokensTextRowsDataContextParams>) {
  const [tokensTextRows, setTokensTextRows] = useState<TokensTextRow[]>([]);

  const getTokensTextRows = (verseTextArray: VerseText[]): TokensTextRow[] =>
    verseTextArray.map((verseText) => {
      const vRef = new VerseRef(verseText.verseRef);
      let wordNumber = 0;
      return new TokensTextRow({
        ref: verseText.verseRef,
        tokens: verseText.text.split(' ').map((tokenText) => {
          wordNumber += 1;
          return new PaddedToken({
            tokenId: {
              bookNumber: vRef.bookNum,
              chapterNumber: vRef.chapterNum,
              verseNumber: vRef.verseNum,
              wordNumber,
              subWordNumber: 1,
            },
            surfaceText: tokenText,
            trainingText: tokenText,
            position: wordNumber,
            surfaceTextPrefix: '',
            surfaceTextSuffix: '',
            paddingBefore: '',
            paddingAfter: ' ',
          });
        }),
      });
    });

  useEffect(() => setTokensTextRows(getTokensTextRows(verseTexts)), [verseTexts]);

  return (
    <TokensTextRowsInfoContext.Provider
      value={useMemo(() => {
        return {
          corpusId,
          corpusName,
          tokensTextRows,
        };
      }, [corpusId, corpusName, tokensTextRows])}
    >
      {children}
    </TokensTextRowsInfoContext.Provider>
  );
}

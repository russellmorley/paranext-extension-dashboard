import { PropsWithChildren, useEffect, useState } from "react";
import { PaddedToken, TokensTextRow, TokensTextRowsInfoContext } from "./tokenstextrows.context";
import { VerseRef } from "@sillsdev/scripture";

export type VerseText = {
  verseRef: string,
  text: string
};

export type AquaTokensTextRowsDataContextParams = {
  corpusId: string,
  corpusName: string,
  verseTexts: VerseText[];
}

export function AquaTokenTextRowsDataContext({ children, corpusId, corpusName, verseTexts } : PropsWithChildren<AquaTokensTextRowsDataContextParams>) {
  const [tokensTextRows, setTokensTextRows] = useState([] as TokensTextRow[]);

  const getTokensTextRows = (verseTexts: VerseText[]): TokensTextRow[] =>
    verseTexts.map(verseText => {
      const vRef = new VerseRef(verseText.verseRef);
      let wordNumber = 0;
      return new TokensTextRow({
        ref: verseText.verseRef,
        tokens: verseText.text.split(" ").map(tokenText => {
          wordNumber = wordNumber + 1;
          return new PaddedToken({
            tokenId: {
              bookNumber: vRef.bookNum,
              chapterNumber: vRef.chapterNum,
              verseNumber: vRef.verseNum,
              wordNumber: wordNumber,
              subWordNumber: 1},
            surfaceText: tokenText,
            trainingText: tokenText,
            position: wordNumber,
            surfaceTextPrefix: '',
            surfaceTextSuffix: '',
            paddingBefore: '',
            paddingAfter: ' '})
        })
      });
    });

useEffect(
  () => setTokensTextRows(getTokensTextRows(verseTexts)),
  [verseTexts]
);

  return (
    <>
      <TokensTextRowsInfoContext.Provider value={{corpusId: corpusId, corpusName: corpusName, tokensTextRows: tokensTextRows}}>
        {children}
      </TokensTextRowsInfoContext.Provider>
    </>
  );
}

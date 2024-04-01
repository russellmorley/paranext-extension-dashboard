import { PropsWithChildren, useEffect, useState } from "react";
import { PaddedToken, TokensTextRow, TokensTextRowsContext } from "./tokenstextrows.context";
import { VerseRef } from "@sillsdev/scripture";

export type VerseText = {
  verseRef: string,
  text: string
};

export type AquaTokensTextRowsDataContextParams = {
  verseTexts: VerseText[];
}

export function AquaTokenTextRowsDataContext({ children, verseTexts } : PropsWithChildren<AquaTokensTextRowsDataContextParams>) {
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
            bookNumber: vRef.bookNum,
            chapterNumber: vRef.chapterNum,
            verseNumber: vRef.verseNum,
            wordNumber: wordNumber,
            subWordNumber: 1,
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
      <TokensTextRowsContext.Provider value={tokensTextRows}>
        {children}
      </TokensTextRowsContext.Provider>
    </>
  );
}

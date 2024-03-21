import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { CurrentVerseContext } from "./currentverse.context";
import { Token, TokenId, Verse, VersesContext } from "./verses.context";
import { VerseRef } from "@sillsdev/scripture";

export type VerseText = {
  verseRef: string,
  text: string
};

export type AquaNVersesDataContextParams = {
  verseTexts: VerseText[]
}

export function AquaVersesDataContext({ children, verseTexts } : PropsWithChildren<AquaNVersesDataContextParams>) {
  const [verses, setVerses] = useState([] as Verse[]);

  const getVerses = (verseTexts: VerseText[]): Verse[] =>
    verseTexts.map(verseText => {
      const vRef = new VerseRef(verseText.verseRef);
      let wordNumber = 0;
      return {
        verseRef: verseText.verseRef,
        tokens: verseText.text.split(" ").map(tokenText => {
          wordNumber = wordNumber + 1;
          return new Token(new TokenId(vRef.bookNum, vRef.chapterNum, vRef.verseNum, wordNumber, 1), tokenText, tokenText, wordNumber)
        })
      };
    });

useEffect(
  () => setVerses(getVerses(verseTexts)),
  [verseTexts]
);

  return (
    <>
      <VersesContext.Provider value={verses}>
        {children}
      </VersesContext.Provider>
    </>
  );
}

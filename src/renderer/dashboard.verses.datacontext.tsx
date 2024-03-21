import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { CurrentVerseContext } from "./currentverse.context";
import { Token, TokenId, Verse, VersesContext } from "./verses.context";

export function DashboardVersesDataContext({ children } : PropsWithChildren) {
  const verseRef = useContext(CurrentVerseContext);
  const [verses, setVerses] = useState([] as Verse[]);

  useEffect(() => {
    function getVerses() {
      try {
        setVerses([{
          verseRef: "GEN 1:1",
          tokens: [
            new Token(new TokenId(1, 1, 1, 1, 1), "The", "The", 1),
            new Token(new TokenId(1, 1, 1, 2, 1), "moon", "moon", 2),
            new Token(new TokenId(1, 1, 1, 3, 1), "is", "is", 3),
            new Token(new TokenId(1, 1, 1, 4, 1), "white", "white", 4),
          ]
        },
        {
          verseRef: "GEN 1:2",
          tokens: [
            new Token(new TokenId(1, 1, 2, 1, 1), "You", "You", 1),
            new Token(new TokenId(1, 1, 2, 2, 1), "rock", "rock", 2),
            new Token(new TokenId(1, 1, 2, 3, 1), "and", "and", 3),
            new Token(new TokenId(1, 1, 2, 4, 1), "rp;;", "roll", 4),
          ]
        }]);
      } catch(e) {
        console.error(e);
      }
    }
    let ignore = false;
    getVerses();
    return () => {
      ignore = true;
    }
  }, [verseRef]);

  return (
    <>
      <VersesContext.Provider value={verses}>
        {children}
      </VersesContext.Provider>
    </>
  );
}

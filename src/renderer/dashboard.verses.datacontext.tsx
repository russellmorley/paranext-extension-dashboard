import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { CurrentVerseContext } from "./currentverse.context";
import { Verse, VersesContext } from "./verses.context";

export function DashboardVersesDataContext({ children } : PropsWithChildren) {
  const verseRef = useContext(CurrentVerseContext);
  const [verses, setVerses] = useState([] as Verse[]);

  useEffect(() => {
    function getVerses() {
      try {
        const v = "GEN 1:5";
        setVerses([{
          id: 1,
          verseRef: verseRef,
          tokens: [
            {id: 1, text: 'The'},
            {id: 2, text: 'moon'},
            {id: 3, text: 'is'},
            {id: 4, text: 'white.'}
          ]
        },
        {
          id: 2,
          verseRef: verseRef,
          tokens: [
            {id: 5, text: 'You'},
            {id: 6, text: 'rock'},
            {id: 7, text: 'and'},
            {id: 8, text: 'roll.'}
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

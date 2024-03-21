import { useContext } from "react";
import { VersesContext } from "./verses.context";
// import { CurrentVerseContext } from "./currentverse.context";
import { TokenDisplayComponent } from "./tokendisplay.component";
import { VerseRef } from "@sillsdev/scripture";


export function TokenDisplayFromVersesComponent() {
  const verses = useContext(VersesContext);
  // const verseRef = useContext(CurrentVerseContext);

  const versesDisplay = verses.map(verse =>
    <li key={verse.verseRef} style={{listStyleType:"none"}}>
      <span style={{fontSize: "small"}}>
        {verse.verseRef}
      </span>
      <div>
      {verse.tokens.map(token =>
        <span><TokenDisplayComponent token={token} />&nbsp;</span>
      )}
      </div>
    </li>
  );

  return (
    <>
      <div className="verse-wrapper">
        <div className="verse">
          {versesDisplay}
        </div>
      </div>
    </>
  );
}

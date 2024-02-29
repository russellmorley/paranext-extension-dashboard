import { useContext } from "react";
import { VersesContext } from "./verses.context";
import { CurrentVerseContext } from "./currentverse.context";
import { TextFromToken } from "./texttoken.component";


export function VerseTextFromVerses() {
  const verses = useContext(VersesContext);
  const verseRef = useContext(CurrentVerseContext);

  const versesDisplay = verses.map(tokensTextRow =>
    <li>
      {tokensTextRow.tokens.map(token =>
        <span><TextFromToken token={token} />&nbsp;</span>
      )}
    </li>
  );

  return (
    <>
      <div className="verse-wrapper">
        <div className="verse-reference">
          {verseRef}
        </div>
        <div className="verse">
          <span>{versesDisplay}</span>
        </div>
      </div>
    </>
  );
}

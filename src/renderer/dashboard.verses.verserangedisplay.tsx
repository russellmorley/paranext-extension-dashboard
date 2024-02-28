import { useContext } from "react";
import { VersesContext } from "./verses-context";
import { VerseContext } from "./verse-context";
import { TokenDisplay } from "./dashboard.tokendisplay";


export function DashboardVersesVerseRangeDisplay() {
  const verses = useContext(VersesContext);
  const verseRef = useContext(VerseContext);

  const versesDisplay = verses.map(tokensTextRow =>
    <li>
      {tokensTextRow.tokens.map(token =>
        <span><TokenDisplay token={token} />&nbsp;</span>
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

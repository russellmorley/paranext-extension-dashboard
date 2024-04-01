import { useContext } from "react";
import { TokensTextRowsContext } from "./tokenstextrows.context";
import { TokenDisplayComponent } from "./tokendisplay.component";


export function DisplayFromTokensTextRowsComponent() {
  const tokensTextRows = useContext(TokensTextRowsContext);
  // const verseRef = useContext(CurrentVerseContext);

  const display = tokensTextRows.map(verse =>
    <li key={verse.ref} style={{listStyleType:"none"}}>
      <span style={{fontSize: "small"}}>
        {verse.ref}
      </span>
      <div>
      {verse.tokens.map(token =>
        <span><TokenDisplayComponent token={token} isError={Math.random() > .95} /></span>
      )}
      </div>
    </li>
  );

  return (
    <>
      <div className="verse-wrapper">
        <div className="verse">
          {display}
        </div>
      </div>
    </>
  );
}

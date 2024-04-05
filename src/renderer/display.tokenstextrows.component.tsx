import { useCallback, useContext, useEffect, useState } from "react";
import { TokensTextRowsInfoContext } from "./tokenstextrows.context";
import { TokenDisplayComponent } from "./tokendisplay.component";
import papi from "@papi/frontend";
import { TextInsight, TokenInfo } from "src/shared/services/textinsights.service";
import { useEvent } from "@papi/frontend/react";
import { DisplayFromTextInsights } from "./display.textinsights.component";
import { useDisclosure } from "@chakra-ui/react";


export function DisplayFromTokensTextRowsComponent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const tokensTextRowsInfo = useContext(TokensTextRowsInfoContext);
  const [textInsightsOpen, setTextInsightsOpen] = useState(false);
  const [textInsights, setTextInsights] = useState([] as TextInsight[])
  const [textInsightsGetComplete, setInsightsGetComplete] = useState(false);

  const display = tokensTextRowsInfo.tokensTextRows.map(tokensTextRow =>
    <li key={tokensTextRow.ref} style={{listStyleType:"none"}}>
      <span style={{fontSize: "small"}}>
        {tokensTextRow.ref}
      </span>
      <div>
        <span data-ref={tokensTextRow.ref}>
          {tokensTextRow.tokens.map(token =>
            <TokenDisplayComponent key={token.tokenId.toString()} token={token} isError={Math.random() > .95} />
          )}
        </span>
      </div>
    </li>
  );

  useEvent<TextInsight>(
    'textinsights.get',
      useCallback(async (textInsight: TextInsight) => {
        console.debug(`Received text insight ${JSON.stringify(textInsight)}`);
        setTextInsights(textInsights.concat(textInsight));
      }, [textInsights]),
  );

  useEvent<TextInsight>(
    'textinsights.getcomplete',
      useCallback(() => {
        console.debug(`Received all text insights complete`);
        setInsightsGetComplete(true);
      }, []),
  );

  const onMouseUp = async () => {
    const selection = window.getSelection();
    const selectedTokenInfos: TokenInfo[] =[];

    const focusDataLocElement = selection?.anchorNode?.parentElement?.parentElement;
    const anchorDataLocElement = selection?.focusNode?.parentElement?.parentElement;

    if (anchorDataLocElement?.parentElement?.dataset.ref === undefined ||
      focusDataLocElement?.parentElement?.dataset.ref === undefined ||
      focusDataLocElement?.parentElement?.dataset.ref !== anchorDataLocElement?.parentElement?.dataset.ref) {

      console.debug('refs of anchor or focus is undefined or not equal. returning.');
      return;
    }
    const dataRefElement = focusDataLocElement?.parentElement;

    let found = false;
    for (let i = 0; i < dataRefElement.children.length; i++) {
      const locElement = dataRefElement.children.item(i) as HTMLElement;
      if (locElement.dataset.loc === focusDataLocElement.dataset.loc || locElement.dataset.loc === anchorDataLocElement.dataset.loc || found) {
        if (!found)
          found = true;
        else if ((locElement.dataset.loc === focusDataLocElement.dataset.loc || locElement.dataset.loc === anchorDataLocElement.dataset.loc) && found)
          found = false;
        let text: string = '';
        locElement.childNodes.forEach(child => text = `${text}${child.childNodes.length > 0 ? child.childNodes[0].nodeValue : ''}`);
        if (text.length > 0)
          selectedTokenInfos.push({location: locElement.dataset.loc, text: text});
        if (focusDataLocElement.dataset.loc === anchorDataLocElement.dataset.loc)
          break;
      }
    }
    console.debug(JSON.stringify(selectedTokenInfos));
    setTextInsights([] as TextInsight[]);
    onOpen();
    setTextInsightsOpen(true);
    const result = await papi.commands.sendCommand(
      'textinsights.get',
      selectedTokenInfos
    );
  }

  return (
    <>
      <div>
        Corpus Id: {tokensTextRowsInfo.corpusId}&nbsp;Corpus Name: {tokensTextRowsInfo.corpusName}&nbsp;
      </div>
      <div className="tokenstextrows" onMouseUp={onMouseUp}>
        {display}
      </div>
      <DisplayFromTextInsights textInsights={textInsights} isOpen={isOpen} onClose={onClose} allTextInsightsIncluded={textInsightsGetComplete}></DisplayFromTextInsights>
    </>
  );
}

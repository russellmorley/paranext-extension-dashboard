import { useCallback, useContext, useState } from "react";
import { TokensTextRowsInfoContext } from "./tokenstextrows.context";
import { TokenDisplayComponent } from "./tokendisplay.component";
import papi from "@papi/frontend";
import { TextInsights, TokenInfo } from "src/shared/services/textinsights.service";
import { useEvent } from "@papi/frontend/react";
import { GetTextInsightsCompleteEvent } from "src/extension-host/commands/textinsights.command";
import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Spinner, useDisclosure } from "@chakra-ui/react";


export function DisplayFromTokensTextRowsComponent() {
  const tokensTextRowsInfo = useContext(TokensTextRowsInfoContext);
  const [isLoading, setIsLoading] = useState(false);
  const [textInsights, setTextInsights] = useState({} as TextInsights)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const display = tokensTextRowsInfo.tokensTextRows.map(tokensTextRow =>
    <li key={tokensTextRow.ref} style={{listStyleType:"none"}}>
      <span style={{fontSize: "small"}}>
        {tokensTextRow.ref}
      </span>
      <div>
        <span data-ref={tokensTextRow.ref}>
          {tokensTextRow.tokens.map(token =>
            <TokenDisplayComponent token={token} isError={Math.random() > .95} />
          )}
        </span>
      </div>
    </li>
  );

  useEvent<GetTextInsightsCompleteEvent>(
    'textinsights.get',
      useCallback((textInsightsCompeteEvent: GetTextInsightsCompleteEvent) => {
        console.debug(`Received text insights ${JSON.stringify(textInsightsCompeteEvent)}`);
        setIsLoading(false);
        setTextInsights(textInsightsCompeteEvent);
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
    setTextInsights({} as TextInsights);
    setIsLoading(true);
    onOpen();
    const result = await papi.commands.sendCommand(
      'textinsights.get',
      selectedTokenInfos
    );
  }

  const onCloseCustom = () => {
    onClose();
    // setIsLoading(false);
    // setTextInsights({} as TextInsights);
  };

  return (
    <>
      <div>
        Corpus Id: {tokensTextRowsInfo.corpusId}&nbsp;Corpus Name: {tokensTextRowsInfo.corpusName}&nbsp;
      </div>
      <div className="tokenstextrows" onMouseUp={onMouseUp}>
        {display}
      </div>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onCloseCustom}
        // finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {isLoading ? (
              <Spinner></Spinner>
            ) : (
              textInsights?.tokenInfos
                ?.map(tokenInfo => tokenInfo.text)
                ?.reduce((accumulator, current) => `${accumulator}${current}`)
            )}
          </DrawerHeader>
          <DrawerBody>
            {isLoading ? (
                <Spinner></Spinner>
              ) : (
                JSON.stringify(textInsights.insights)
              )}
          </DrawerBody>
          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onCloseCustom}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

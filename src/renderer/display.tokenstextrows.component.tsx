import { useContext, useState } from 'react';
import papi, { logger } from '@papi/frontend';
import { TextInsight, TokenInfo } from 'src/shared/services/textinsights.service';
// import { useEvent } from 'platform-bible-react';
import { useDisclosure } from '@chakra-ui/react';
import { DisplayFromTextInsights } from './display.textinsights.component';
import { TokenDisplayComponent } from './tokendisplay.component';
import { TokensTextRowsInfoContext } from './tokenstextrows.context';

// eslint-disable-next-line import/prefer-default-export
export function DisplayFromTokensTextRowsComponent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const tokensTextRowsInfo = useContext(TokensTextRowsInfoContext);
  const [, setTextInsightsOpen] = useState(false);
  const [textInsights, setTextInsights] = useState<TextInsight[]>([]);
  const [textInsightsGetComplete] = useState(false);

  const display = tokensTextRowsInfo.tokensTextRows.map((tokensTextRow) => (
    <li key={tokensTextRow.ref} style={{ listStyleType: 'none' }}>
      <span style={{ fontSize: 'small' }}>{tokensTextRow.ref}</span>
      <div>
        <span data-ref={tokensTextRow.ref}>
          {tokensTextRow.tokens.map((token) => (
            <TokenDisplayComponent
              key={token.tokenId.toString()}
              token={token}
              isError={Math.random() > 0.95}
            />
          ))}
        </span>
      </div>
    </li>
  ));

  /*
  useEvent<TextInsight>(
    'textinsights.get',
    useCallback(
      async (textInsight: TextInsight) => {
        console.debug(`Received text insight ${JSON.stringify(textInsight)}`);
        setTextInsights(textInsights.concat(textInsight));
      },
      [textInsights],
    ),
  );

  useEvent<TextInsight>(
    'textinsights.getcomplete',
    useCallback(() => {
      console.debug(`Received all text insights complete`);
      setInsightsGetComplete(true);
    }, []),
  );
  */

  const onMouseUp = async () => {
    const selection = window.getSelection();
    const selectedTokenInfos: TokenInfo[] = [];

    const focusDataLocElement = selection?.anchorNode?.parentElement?.parentElement;
    const anchorDataLocElement = selection?.focusNode?.parentElement?.parentElement;

    if (
      anchorDataLocElement?.parentElement?.dataset.ref === undefined ||
      focusDataLocElement?.parentElement?.dataset.ref === undefined ||
      focusDataLocElement?.parentElement?.dataset.ref !==
        anchorDataLocElement?.parentElement?.dataset.ref
    ) {
      logger.debug('refs of anchor or focus is undefined or not equal. returning.');
      return;
    }
    const dataRefElement = focusDataLocElement?.parentElement;

    let found = false;
    for (let i = 0; i < dataRefElement.children.length; i++) {
      // Not sure if this is OK
      // eslint-disable-next-line no-type-assertion/no-type-assertion
      const locElement = dataRefElement.children.item(i) as HTMLElement;
      if (
        locElement.dataset.loc === focusDataLocElement.dataset.loc ||
        locElement.dataset.loc === anchorDataLocElement.dataset.loc ||
        found
      ) {
        if (!found) found = true;
        else if (
          (locElement.dataset.loc === focusDataLocElement.dataset.loc ||
            locElement.dataset.loc === anchorDataLocElement.dataset.loc) &&
          found
        )
          found = false;
        let text: string = '';
        locElement.childNodes.forEach((child) => {
          text = `${text}${child.childNodes.length > 0 ? child.childNodes[0].nodeValue : ''}`;
        });
        if (text.length > 0) selectedTokenInfos.push({ location: locElement.dataset.loc, text });
        if (focusDataLocElement.dataset.loc === anchorDataLocElement.dataset.loc) break;
      }
    }
    logger.debug(JSON.stringify(selectedTokenInfos));
    setTextInsights([]);
    onOpen();
    setTextInsightsOpen(true);
    await papi.commands.sendCommand('textinsights.get', selectedTokenInfos);
  };

  // No idea if this is OK
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <>
      <div>
        Corpus Id: {tokensTextRowsInfo.corpusId}&nbsp;Corpus Name: {tokensTextRowsInfo.corpusName}
        &nbsp;
      </div>
      <div className="tokenstextrows" onMouseUp={onMouseUp}>
        {display}
      </div>
      <DisplayFromTextInsights
        textInsights={textInsights}
        isOpen={isOpen}
        onClose={onClose}
        allTextInsightsIncluded={textInsightsGetComplete}
      />
    </>
  );
  /* eslint-enable jsx-a11y/no-static-element-interactions */
}

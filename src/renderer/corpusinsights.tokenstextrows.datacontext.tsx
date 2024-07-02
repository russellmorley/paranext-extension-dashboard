import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { TokensTextRow, TokensTextRowsInfo, TokensTextRowsInfoContext } from "./tokenstextrows.context";
import { EnvironmentContext } from "./environment.context";
import { CorpusInsightsService } from "src/shared/services/corpusinsights.service";

type DataContextParams = {
  verseRef: string;
};

export function CorpusInsightsTokensTextRowsDataContext({ children, verseRef } : PropsWithChildren<DataContextParams>) {
  const environment = useContext(EnvironmentContext);
  if (!environment.requester)
    throw new Error("environment requester must be set for this service");

  const [isLoading, setIsLoading] = useState(false);
  const [tokensTextRowsInfo, setTokensTextRowsInfo] = useState({tokensTextRows: [] as TokensTextRow[]} as TokensTextRowsInfo);

  const [corpusService] = useState(new CorpusInsightsService(
    'https://fxmhfbayk4.us-east-1.awsapprunner.com/v2',
    {
      // mode: 'no-cors',
      headers: {
        "api_key": "7cf43ae52dw8948ddb663f9cae24488a4",
        // origin: "https://fxmhfbayk4.us-east-1.awsapprunner.com",
      },
      // credentials: "include",
    },
    environment!.requester,
    environment.persist,
  ));

  class SettingsWebviewState {
    tokenizedtextcorpus_id: string | undefined;
    tokenizedtextcorpus_name: string | undefined;
    versesbeforenumber: string | undefined;
    versesafternumber: string | undefined;
    
    constructor(init?: Partial<SettingsWebviewState>) {
      Object.assign(this, init);
    }
  }
  const settings = window.getWebViewState<SettingsWebviewState>(
    '_settings',
    new SettingsWebviewState({
      tokenizedtextcorpus_id: '32',
      tokenizedtextcorpus_name: 'ERV-AR',
      versesbeforenumber: '0',
      versesafternumber: '0',
    }));
  // if (!settings)
  //   return undefined;
  
  const tokenizedTextCorpusId = settings.tokenizedtextcorpus_id;
  const tokenizedTextCorpusName = settings.tokenizedtextcorpus_name ? settings.tokenizedtextcorpus_name : '<not set>';
  const versesBefore = settings.versesbeforenumber;
  const versesAfter = settings.versesafternumber;
  if (!tokenizedTextCorpusId)
    return undefined;

  let versesBeforeNumber: number;
  let versesAfterNumber: number;

  if (versesBefore !== undefined)
    versesBeforeNumber = parseInt(versesBefore);
  else
    versesBeforeNumber = 0;

    if (versesAfter !== undefined)
      versesAfterNumber = parseInt(versesAfter);
    else
      versesAfterNumber = 0;

  console.debug(`Verseref: ${verseRef}; tokenizedTextCorpusId: ${tokenizedTextCorpusId}, versesBefore: ${versesBefore}; versesAfter: ${versesAfter}`);

  useEffect(() => {
    async function getTokensTextRows() {
      try {
        if (!isLoading)
          setIsLoading(true);
        const tokensTextRowsInfo = await corpusService.getByVerseRange(tokenizedTextCorpusId!, tokenizedTextCorpusName, verseRef, versesBeforeNumber, versesAfterNumber);
        if (!ignore) {
          setTokensTextRowsInfo(tokensTextRowsInfo);
        }
      } catch(e) {
        console.error(e);
      } finally {
        if (!ignore)
          setIsLoading(false);
      }
    }
    let ignore = false;
    getTokensTextRows();
    return () => {
      ignore = true;
    }
  }, [verseRef]);

  return (
    <>
      <TokensTextRowsInfoContext.Provider value={tokensTextRowsInfo}>
        {children}
      </TokensTextRowsInfoContext.Provider>
    </>
  );
}

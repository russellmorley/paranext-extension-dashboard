import { PropsWithChildren, useContext, useState } from 'react';
// import { CorpusInsightsService } from 'src/shared/services/corpusinsights.service';
import {
  TokensTextRow,
  TokensTextRowsInfo,
  TokensTextRowsInfoContext,
} from './tokenstextrows.context';
import { EnvironmentContext } from './environment.context';

type DataContextParams = {
  // verseRef: string;
};

// eslint-disable-next-line import/prefer-default-export
export function CorpusInsightsTokensTextRowsDataContext({
  children,
  //  verseRef,
}: PropsWithChildren<DataContextParams>) {
  const environment = useContext(EnvironmentContext);
  if (!environment.requester) throw new Error('environment requester must be set for this service');

  // const [isLoading, setIsLoading] = useState(false);
  const [tokensTextRowsInfo] = useState<TokensTextRowsInfo>({
    corpusId: '',
    corpusName: '',
    // eslint-disable-next-line no-type-assertion/no-type-assertion
    tokensTextRows: [] as TokensTextRow[],
  });

  // This is just broken right now
  /*
  const [corpusService] = useState(
    new CorpusInsightsService(
      'https://fxmhfbayk4.us-east-1.awsapprunner.com/v2',
      {
        // mode: 'no-cors',
        headers: {
          api_key: '7cf43ae52dw8948ddb663f9cae24488a4',
          // origin: "https://fxmhfbayk4.us-east-1.awsapprunner.com",
        },
        // credentials: "include",
      },
      environment.requester,
      // environment.persist,
    ),
  );

  class SettingsWebviewState {
    tokenizedtextcorpus_id: string | undefined;
    tokenizedtextcorpus_name: string | undefined;
    versesbeforenumber: string | undefined;
    versesafternumber: string | undefined;
  }

  const settings = window.getWebViewState<SettingsWebviewState>('_settings');
  if (!settings) return undefined;

  const tokenizedTextCorpusId = settings.tokenizedtextcorpus_id;

  const tokenizedTextCorpusName = settings.tokenizedtextcorpus_name
    ? settings.tokenizedtextcorpus_name
    : '<not set>';

  const versesBefore = settings.versesbeforenumber;
  const versesAfter = settings.versesafternumber;
  if (!tokenizedTextCorpusId) return undefined;

  let versesBeforeNumber: number;
  let versesAfterNumber: number;

  if (versesBefore !== undefined) versesBeforeNumber = parseInt(versesBefore, 10);
  else versesBeforeNumber = 0;

  if (versesAfter !== undefined) versesAfterNumber = parseInt(versesAfter, 10);
  else versesAfterNumber = 0;

  console.debug(
    `Verseref: ${verseRef}; tokenizedTextCorpusId: ${tokenizedTextCorpusId}, versesBefore: ${versesBefore}; versesAfter: ${versesAfter}`,
  );

  useEffect(() => {
    async function getTokensTextRows() {
      try {
        if (!isLoading) setIsLoading(true);
        const tokensTextRowsInfo = await corpusService.getByVerseRange(
          tokenizedTextCorpusId!,
          tokenizedTextCorpusName,
          verseRef,
          versesBeforeNumber,
          versesAfterNumber,
        );
        if (!ignore) {
          setTokensTextRowsInfo(tokensTextRowsInfo);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    let ignore = false;
    getTokensTextRows();
    return () => {
      ignore = true;
    };
  }, [verseRef]);
  */

  return (
    <TokensTextRowsInfoContext.Provider value={tokensTextRowsInfo}>
      {children}
    </TokensTextRowsInfoContext.Provider>
  );
}

import { CurrentVerseContext } from './currentverse.context';
import { useCallback, useState } from 'react';
import { useEvent } from 'platform-bible-react';
import { DashboardVerseChangeEvent, ParanextVerseChangeEvent } from 'paranext-extension-dashboard';
import { EnvironmentContext } from "./environment.context";
import { httpPapiFrontRequester } from "./utils/http.papifront.requester.util";
import { AsyncTask } from "./utils/async-task.util";

import papi from "@papi/frontend";

import { InputGroup, Input, InputRightElement, Button } from "@chakra-ui/react";
import { CorpusInsightsAppComponent } from "./corpusinsights.app.component";

globalThis.webViewComponent = function CorpusInsightsWebView() {
  const [verseRef, setVerseRef] = useState('GEN 1:2'); //FIXME: set back to '' once testing complete

  useEvent<DashboardVerseChangeEvent>(
    papi.network.getNetworkEvent('platform.dashboardVerseChange'),
    useCallback(({ verseRefString, verseOffsetIncluded }) => {
      setVerseRef(verseRefString);
      console.debug(`Received verse update from dashboard ${verseRefString} ${verseOffsetIncluded}`);
      }, []),
  );

  useEvent<ParanextVerseChangeEvent>(
    papi.network.getNetworkEvent('platform.paranextVerseChange'),
    useCallback(async ({ verseRefString, verseOffsetIncluded }) => {
      setVerseRef(verseRefString);
      console.debug(`Received verse update from paratext ${verseRefString} ${verseOffsetIncluded}`);
    }, []),
  );

  const [textInput, setTextInput] = useState('');
  const handleChange = (event: { target: { value: any; }; }) => {
    setTextInput(event.target.value);
  }

  let verseText = verseRef;
  return (
    <CurrentVerseContext.Provider value={verseRef}>
      <EnvironmentContext.Provider value={{requester: httpPapiFrontRequester, persist: undefined, asyncTask: new AsyncTask() }} >
        <InputGroup size='md'>
          <Input
            style={{
              width: '100%'
            }}
            pr='4.5rem'
            type={'text'}
            onChange={handleChange}
            placeholder='Navigate paranext to new verse, e.g. GEN 1:1'
          />
          {textInput.length > 6 && (
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={async () => {
                  const start = performance.now();
                  const result = await papi.commands.sendCommand(
                    'platform.paranextVerseChange',
                    textInput,
                    1,
                  );
                }}>
                {'Go'}
              </Button>
            </InputRightElement>
          )}
        </InputGroup>
            {/* <input onChange={handleChange} placeholder={"Enter a verse ref, e.g. GEN 1:1"}></input>
            <Button
              onClick={async () => {
                const start = performance.now();
                const result = await papi.commands.sendCommand(
                  'platform.paranextVerseChange',
                  textInput,
                  1,
                );
              }}
            >
                Trigger verse change from paranext
            </Button> */}
        <CorpusInsightsAppComponent />
      </EnvironmentContext.Provider>
    </CurrentVerseContext.Provider>
  );
}

import {ComponentList} from "./componentlist.component";
import { CurrentVerseContext } from './currentverse.context';
import { useCallback, useState } from 'react';
import { useEvent } from '@papi/frontend/react';
import { DashboardVerseChangeEvent, ParanextVerseChangeEvent } from 'paranext-extension-dashboard';
import { EnvironmentContext } from "./environment.context";
import { httpPapiFrontRequester } from "./utils/http.papifront.requester.util";
import { AsyncTask } from "./utils/async-task.util";

import papi from "@papi/frontend";

globalThis.webViewComponent = function VerseAwareWebView() {
  const [verseRef, setVerseRef] = useState('GEN 1:2'); //FIXME: set back to '' once testing complete

  useEvent<DashboardVerseChangeEvent>(
    'platform.dashboardVerseChange',
    useCallback(({ verseRefString, verseOffsetIncluded }) => {
      setVerseRef(verseRefString);
      console.debug(`Received verse update from dashboard ${verseRefString} ${verseOffsetIncluded}`);
      }, []),
  );

  useEvent<ParanextVerseChangeEvent>(
    'platform.paranextVerseChange',
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
        <div>
            <input onChange={handleChange} placeholder={"Enter a verse ref, e.g. GEN 1:1"}></input>
            <button
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
            </button>
        </div>

        <ComponentList />
      </EnvironmentContext.Provider>
    </CurrentVerseContext.Provider>
  );
}

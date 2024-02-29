import {ComponentList} from "./componentlist.component";
import { CurrentVerseContext } from './currentverse.context';
import { useCallback, useState } from 'react';
import { useEvent } from '@papi/frontend/react';
import { DashboardVerseChangeEvent, ParanextVerseChangeEvent } from 'paranext-extension-dashboard';
import { EnvironmentContext } from "./environment.context";
import { httpPapiFrontRequester } from "./utils/http.papifront.requester.util";
import { AsyncTask } from "./utils/async-task.util";

globalThis.webViewComponent = function VerseAwareWebView() {
  const [verseRef, setVerseRef] = useState('');

  useEvent<DashboardVerseChangeEvent>(
    'platform.dashboardVerseChange',
    useCallback(({ verseRefString, verseOffsetIncluded }) => {
      setVerseRef(verseRefString);
      console.log(`Received verse update from dashboard ${verseRefString} ${verseOffsetIncluded}`);
      }, []),
  );

  useEvent<ParanextVerseChangeEvent>(
    'platform.paranextVerseChange',
    useCallback(async ({ verseRefString, verseOffsetIncluded }) => {
      setVerseRef(verseRefString);
      console.log(`Received verse update from paratext ${verseRefString} ${verseOffsetIncluded}`);
    }, []),
  );

  // run in paranext renderer:

  return (
    <CurrentVerseContext.Provider value={verseRef}>
      <EnvironmentContext.Provider value={{requester: httpPapiFrontRequester, persist: undefined, asyncTask: new AsyncTask() }} >
        <ComponentList />
      </EnvironmentContext.Provider>
    </CurrentVerseContext.Provider>
  );
}

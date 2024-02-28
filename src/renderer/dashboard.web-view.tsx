import {DashboardList} from "./dashboard.list";
import { VerseContext } from './verse-context';
import { useCallback, useState } from 'react';
import { useEvent } from '@papi/frontend/react';
import { DashboardVerseChangeEvent, ParanextVerseChangeEvent } from 'paranext-extension-dashboard';

globalThis.webViewComponent = function DashboardWebView() {
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

  return (
    <VerseContext.Provider value={verseRef}>
      <DashboardList />
    </VerseContext.Provider>
  );
}

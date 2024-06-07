import papi, { logger } from '@papi/frontend';
import { useEvent } from 'platform-bible-react';
import { useCallback } from 'react';
import type { ParanextVerseChangeEvent } from 'paranext-extension-dashboard';

globalThis.webViewComponent = function DashboardIntegration() {
  useEvent<ParanextVerseChangeEvent>(
    'platform.paranextVerseChange',
    useCallback(async ({ verseRefString, verseOffsetIncluded }) => {
      // eslint-disable-next-line no-undef
      await CefSharp.BindObjectAsync('dashboardAsync');
      // eslint-disable-next-line no-undef
      try {
        // eslint-disable-next-line no-undef
        const response = await await dashboardAsync.verseChange(verseRefString);
        // eslint-disable-next-line no-console
        console.log(`RECEIVED_RESPONSE ${response}}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(`Error getting RESPONSE: ${e}`);
      }
    }, []),
  );

  const doDashboardVerseChangePromise = papi.commands.registerCommand(
    'platform.dashboardServiceRequest',
    async (request: string): Promise<string> => {
      logger.info(`DashboardServiceRequest: ${request}`);

      await CefSharp.BindObjectAsync('dashboardAsync');
      // eslint-disable-next-line no-undef
      try {
        // eslint-disable-next-line no-undef
        const response = await dashboardAsync.serviceRequest(request);
        // eslint-disable-next-line no-console
        //console.log(`RECEIVED_RESPONSE ${response}}`);
        // return new Promise<string>(() => response);
        return response;
      } catch (e) {
        // eslint-disable-next-line no-console
        //console.log(`Error getting RESPONSE: ${e}`);
        return new Promise<string>(() => `Error: ${e}`);
      }

      // Inform subscribers of the verse change
      // const responsePromise: Promise<string> = new Promise(() => "this is the response");
      // onDashboardServiceResponseEmitter.emit({
      //   responsePromise,
      // });
      // return responsePromise;
    },
  );

  // useEffect(() => {
  //   async function setup() {
  //     // const onDashboardServiceResponseEmitter =
  //     //   papi.network.createNetworkEventEmitter<DashboardServiceRequestEvent>('platform.dashboardServiceRequest');

  //    }
  //   setup();
  // }, []);

  return undefined;
};

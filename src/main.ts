import { registerGetTextInsightsCommand } from 'src/extension-host/commands/textinsights.command'; // register the text insights service
import papi, { logger } from '@papi/backend';
import {
  ExecutionActivationContext,
  IWebViewProvider,
  SavedWebViewDefinition,
  WebViewDefinition,
} from '@papi/core';
import type {
  DashboardVerseChangeEvent,
  ParanextVerseChangeEvent,
} from 'paranext-extension-dashboard';

import dashboardIntegrationWebview from './renderer/dashboard-integration.web-view?inline';
import aquaWebView from './renderer/aqua.web-view?inline';
import aquaWebViewStyles from './renderer/aqua.web-view.scss?inline';
import corpusInsightsWebView from './renderer/corpusinsights.web-view?inline';
import corpusInsightsWebViewStyles from './renderer/corpusinsights.web-view.scss?inline';
import { AquaDataProviderEngine } from './extension-host/dataproviders/aqua.dataprovider';

const dashboardIntegrationWebViewType = 'dashboardintegration.webview';
const dashboardIntegrationWebViewProvider: IWebViewProvider = {
  async getWebView(savedWebView: SavedWebViewDefinition): Promise<WebViewDefinition | undefined> {
    if (savedWebView.webViewType !== dashboardIntegrationWebViewType)
      throw new Error(
        `${dashboardIntegrationWebViewType} provider received request to provide a ${savedWebView.webViewType} web view`,
      );
    return {
      ...savedWebView,
      title: 'Headless webview for Dashboard Services (API)',
      content: dashboardIntegrationWebview,
    };
  },
};

const aquaWebViewType = 'aqua.webview';
const aquaWebViewProvider: IWebViewProvider = {
  async getWebView(savedWebView: SavedWebViewDefinition): Promise<WebViewDefinition | undefined> {
    if (savedWebView.webViewType !== aquaWebViewType)
      throw new Error(
        `${aquaWebViewType} provider received request to provide a ${savedWebView.webViewType} web view`,
      );
    return {
      ...savedWebView,
      title: 'AQuA Webview',
      content: aquaWebView,
      styles: aquaWebViewStyles,
    };
  },
};

const corpusInsightsWebViewType = 'corpusinsights.webview';
const corpusInsightsWebViewProvider: IWebViewProvider = {
  async getWebView(savedWebView: SavedWebViewDefinition): Promise<WebViewDefinition | undefined> {
    if (savedWebView.webViewType !== corpusInsightsWebViewType)
      throw new Error(
        `${corpusInsightsWebViewType} provider received request to provide a ${savedWebView.webViewType} web view`,
      );
    return {
      ...savedWebView,
      title: 'Tokenized Corpus Webview',
      content: corpusInsightsWebView,
      styles: corpusInsightsWebViewStyles,
    };
  },
};

export async function activate(context: ExecutionActivationContext) {
  const aquaDataProviderEngine = new AquaDataProviderEngine(
    context.executionToken,
    'aquadataproviderengine',
  );
  const aquaDataProviderPromise = papi.dataProviders.registerEngine(
    'aqua.results',
    aquaDataProviderEngine,
  );

  const dashboardIntegrationWebViewProviderPromise = papi.webViewProviders.register(
    dashboardIntegrationWebViewType,
    dashboardIntegrationWebViewProvider,
  );

  const aquaWebViewProviderPromise = papi.webViewProviders.register(
    aquaWebViewType,
    aquaWebViewProvider,
  );

  const corpusInsightsWebViewProviderPromise = papi.webViewProviders.register(
    corpusInsightsWebViewType,
    corpusInsightsWebViewProvider,
  );

  const onDashboardVerseChangeEmitter =
    papi.network.createNetworkEventEmitter<DashboardVerseChangeEvent>(
      'platform.dashboardVerseChange',
    );

  const doDashboardVerseChangePromise = papi.commands.registerCommand(
    'platform.dashboardVerseChange',
    (verseRefString: string, verseOffsetIncluded: number) => {
      logger.info(`DashboardVerseRef: ${verseRefString}; offset: ${verseOffsetIncluded}`);
      // Inform subscribers of the verse change
      onDashboardVerseChangeEmitter.emit({
        verseRefString,
        verseOffsetIncluded,
      });
    },
  );

  const onParanextVerseChangeEmitter =
    papi.network.createNetworkEventEmitter<ParanextVerseChangeEvent>(
      'platform.paranextVerseChange',
    );

  const doParanextVerseChangePromise = papi.commands.registerCommand(
    'platform.paranextVerseChange',
    (verseRefString: string, verseOffsetIncluded: number) => {
      logger.info(`ParanextVerseRef: {verseRefString}; offset: {verseOffsetIncluded}`);
      // Inform subscribers of the verse change
      onParanextVerseChangeEmitter.emit({
        verseRefString,
        verseOffsetIncluded,
      });
    },
  );

  const registerGetTextInsightsPromise = registerGetTextInsightsCommand();

  papi.webViews.getWebView(dashboardIntegrationWebViewType, undefined, { existingId: '?' });
  papi.webViews.getWebView(aquaWebViewType, undefined, { existingId: '?' });

  // Await the data provider promise at the end so we don't hold everything else up
  context.registrations.add(
    await aquaDataProviderPromise,

    await dashboardIntegrationWebViewProviderPromise,
    await aquaWebViewProviderPromise,
    await corpusInsightsWebViewProviderPromise,

    onDashboardVerseChangeEmitter,
    onParanextVerseChangeEmitter,
    await doDashboardVerseChangePromise,
    await doParanextVerseChangePromise,
    await registerGetTextInsightsPromise,
  );
}

export async function deactivate() {
  return true;
}

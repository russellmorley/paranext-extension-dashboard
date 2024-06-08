import papi from '@papi/backend';
import {
  TextInsight,
  TextInsightsService,
  TokenInfo,
} from 'src/shared/services/textinsights.service';

const onGetTextInsightEmitter =
  papi.network.createNetworkEventEmitter<TextInsight>('textinsights.get');

const onGetTextInsightsCompleteEmitter = papi.network.createNetworkEventEmitter<void>(
  'textinsights.getcomplete',
);

const textInsightsService = new TextInsightsService();

export const registerGetTextInsightsCommand = () =>
  papi.commands.registerCommand('textinsights.get', async (tokenInfos: TokenInfo[]) => {
    const textInsights = textInsightsService.get(tokenInfos);
    let textInsightsPendingCount = textInsights.length;

    textInsights.forEach(async (textInsight) => {
      await textInsight.retrieveResult();
      onGetTextInsightEmitter.emit(textInsight);
      textInsightsPendingCount -= 1;
      if (textInsightsPendingCount === 0) onGetTextInsightsCompleteEmitter.emit();
    });
  });

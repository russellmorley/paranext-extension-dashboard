import papi, { logger } from "@papi/backend";
import { TextInsights, TextInsightsService, TokenInfo } from "src/shared/services/textinsights.service";

export type GetTextInsightsCompleteEvent = TextInsights;

const onGetTextInsightsCompleteEmitter =
papi.network.createNetworkEventEmitter<GetTextInsightsCompleteEvent>('textinsights.get');

const textInsightsService = new TextInsightsService();

export const registerGetTextInsightsCommand = () => papi.commands.registerCommand(
  'textinsights.get',
  async (tokenInfos: TokenInfo[]) => {
    const textInsights = await textInsightsService.get(tokenInfos);
    onGetTextInsightsCompleteEmitter.emit(textInsights);
  },
);

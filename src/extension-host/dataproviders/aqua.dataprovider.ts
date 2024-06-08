import { DataProviderEngine } from '@papi/backend';
import { ExecutionToken, IDataProviderEngine } from '@papi/core';
import { AquaService, IAquaService } from 'src/shared/services/aqua.service';
import type { AquaDataTypes, Results, ResultsSelector } from 'paranext-extension-dashboard';
import { UnsubscriberAsync } from 'platform-bible-utils';
import { ExtensionStoragePersist } from '../services/extension-storage.persist.service';
import { httpPapiBackRequester } from '../utils/http.papiback.requester.util';

export class AquaDataProviderEngine
  extends DataProviderEngine<AquaDataTypes>
  implements IDataProviderEngine<AquaDataTypes>, IAquaService
{
  aquaService: AquaService;

  dispose?: UnsubscriberAsync | undefined;

  onDidDispose?: undefined;

  constructor(token: ExecutionToken, prefix: string) {
    super();

    this.aquaService = new AquaService(
      'https://fxmhfbayk4.us-east-1.awsapprunner.com/v2',
      {
        // mode: 'no-cors',
        headers: {
          api_key: '7cf43ae52dw8948ddb663f9cae24488a4',
          // origin: "https://fxmhfbayk4.us-east-1.awsapprunner.com",
        },
        // credentials: "include",
      },
      httpPapiBackRequester,
      new ExtensionStoragePersist(token, prefix),
    );
  }

  async getResults({ assessmentId, book, aggregateByChapter }: ResultsSelector): Promise<Results> {
    const results = await this.aquaService.getResults({ assessmentId, book, aggregateByChapter });
    return results;
  }

  // eslint-disable-next-line class-methods-use-this
  async setResults() {
    return false;
  }
}

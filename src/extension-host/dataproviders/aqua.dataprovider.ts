import { DataProviderEngine } from "@papi/backend";
import { ExecutionToken, IDataProviderEngine, UnsubscriberAsync } from "@papi/core";
import { DataProviderDataType, DataProviderGetter, DataProviderSetter } from "shared/models/data-provider.model";
import { AquaService, IAquaService} from "src/shared/services/aqua.service";
import type {
  AquaDataTypes,
  Result,
  Results,
  ResultsSelector,
} from 'paranext-extension-dashboard';
import {ExtensionStoragePersist} from '../services/extension-storage.persist.service';
import { httpPapiBackRequester } from "../utils/http.papiback.requester.util";

export class AquaDataProviderEngine
  extends DataProviderEngine<AquaDataTypes>
  implements IDataProviderEngine<AquaDataTypes>, IAquaService
{
  aquaService: AquaService;

  constructor(token: ExecutionToken, prefix: string) {
    super();

    this.aquaService = new AquaService(
      'https://fxmhfbayk4.us-east-1.awsapprunner.com/v2',
      {
        // mode: 'no-cors',
        headers: {
          "api_key": "7cf43ae52dw8948ddb663f9cae24488a4",
          // origin: "https://fxmhfbayk4.us-east-1.awsapprunner.com",
        },
        // credentials: "include",
      },
      httpPapiBackRequester,
      new ExtensionStoragePersist(token, prefix),
    );
  }

  async getResults({ assessment_id, book }: ResultsSelector): Promise<Result[]> {
    return await this.aquaService.getResults({ assessment_id, book }) as Results;
  }

  dispose?: UnsubscriberAsync | undefined;

  onDidDispose?: undefined;

  setResults: DataProviderSetter<AquaDataTypes, 'Results'> = async () => false;
}

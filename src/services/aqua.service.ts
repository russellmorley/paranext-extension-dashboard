/* eslint-disable no-underscore-dangle */
import papi from '@papi/frontend';

export type Requester = <T>(request: string, configuration?: RequestInit) => Promise<T>;

export const httpRequester: Requester = async <T>(request: string, configuration?: RequestInit) => {
  console.log(configuration);
  const response = await papi.fetch(request, configuration);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return (await response.json()) as Promise<T>;
};

export type Result = {
  id: number;
  assessment_id?: number;
  vref?: string;
  source?: string;
  target?: string;
  score: number;
  flag?: boolean;
  type?: string;
  note?: string;
};

export class AquaService {
  // endpoints
  private readonly version: string = 'version';
  private readonly language: string = 'language';
  private readonly script: string = 'script';

  private readonly revision: string = 'revision';
  private readonly assessment: string = 'assessment';
  private readonly result: string = 'result';

  // configuration
  private baseUri: string;
  private _paramsToInclude: Record<string, any>;
  private _requester: Requester;

  constructor(baseUri: string, paramsToInclude: Record<string, any>, requester: Requester) {
    this.baseUri = baseUri;
    this._paramsToInclude = paramsToInclude;
    this._requester = requester;
  }

  get uri() {
    return this.baseUri;
  }

  set uri(value) {
    this.baseUri = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get paramsToInclude() {
    return this._paramsToInclude;
  }

  set paramsToInclude(value) {
    this._paramsToInclude = value;
  }

  get requester() {
    return this._requester;
  }

  set requester(value) {
    this._requester = value;
  }

  ListResults(assessmentId: number): Promise<Result[]> {
    return this._requester<Result[]>(
      `${this.baseUri}/${this.result}?assessment_id=${assessmentId}`,
      this.paramsToInclude,
    );
  }
}

import { logger } from "@papi/backend";

export type TokenInfo = {
  text: string | null,
  location: string | undefined
};

export class Insights {
  private _val: string

  constructor(val: string) {
    this._val = val;
  }

  toString(): string {
    return this._val;
  }
};

export type TextInsights = {
  tokenInfos: TokenInfo[];
  insights: Insights;
};

export interface ITextInsightsService {
  get(tokenInfos: TokenInfo[]): Promise<TextInsights>;
}

export class TextInsightsService implements ITextInsightsService {
  get(tokenInfos: TokenInfo[]): Promise<TextInsights> {
    logger.debug(JSON.stringify(tokenInfos));
    return new Promise<TextInsights>(resolve =>
      setTimeout(
        () => resolve({tokenInfos: tokenInfos, insights: new Insights(JSON.stringify(tokenInfos))}),
        5000));
  }
}

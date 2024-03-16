declare module 'paranext-extension-dashboard' {
  import { DataProviderDataType, IDataProvider } from '@papi/core';

  export type Results = Result[];

  export type ResultsSelector = {assessment_id: number, book?: string, aggregateByChapter?: boolean};

  export type Result = {
    id?: number;
    assessment_id?: number;
    vref?: string;
    source?: string;
    target?: string;
    revision_text?: string;
    reference_text?: string;
    score?: number;
    flag?: boolean;
    type?: string;
    note?: string;
  };

  export type AquaDataTypes = {
    // Result: DataProviderDataType<Result>;
    Results: DataProviderDataType<ResultsSelector, Results, void>
  }
  export type AquaDataProvider = IDataProvider<AquaDataTypes>;



  export type ExtensionVerseSetData = string | { text: string; isHeresy: boolean };

  export type ExtensionVerseDataTypes = {
    Verse: DataProviderDataType<string, string | undefined, ExtensionVerseSetData>;
    Heresy: DataProviderDataType<string, string | undefined, string>;
    Chapter: DataProviderDataType<[book: string, chapter: number], string | undefined, never>;
  };

  /** Network event that informs subscribers when the command `extensionTemplateHelloWorld.doStuff` is run */
  export type DoStuffEvent = {
    /** How many times the extension template has run the command `extensionTemplateHelloWorld.doStuff` */
    count: number;
  };

  /** Network event that informs subscribers when the platform's verse has changed */
  export type DashboardVerseChangeEvent = {
    /** Scripture.VerseRef in string form */
    verseRefString: string;
    /** The number of verses before and after verseRef, within verseRef's chapter,
     * that are displaying */
    verseOffsetIncluded: number;
  };
  export type ParanextVerseChangeEvent = {
    /** Scripture.VerseRef in string form */
    verseRefString: string;
    /** The number of verses before and after verseRef, within verseRef's chapter,
     * that are displaying */
    verseOffsetIncluded: number;
  };
  export type ExtensionVerseDataProvider = IDataProvider<ExtensionVerseDataTypes>;
}

declare module 'papi-shared-types' {
  import type { AquaDataProvider, ExtensionVerseDataProvider } from 'paranext-extension-dashboard';

  export interface CommandHandlers {
    'extensionTemplateHelloWorld.doStuff': (message: string) => {
      response: string;
      occurrence: number;
    };
  }

  export interface DataProviders {
    'paranextExtensionTemplate.quickVerse': ExtensionVerseDataProvider;
    'aqua.results': AquaDataProvider;
  }
}

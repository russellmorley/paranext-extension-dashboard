declare module 'paranext-extension-dashboard' {
  import { DataProviderDataType, IDataProvider } from '@papi/core';

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
  import type { ExtensionVerseDataProvider } from 'paranext-extension-dashboard';

  export interface CommandHandlers {
    'extensionTemplateHelloWorld.doStuff': (message: string) => {
      response: string;
      occurrence: number;
    };
  }

  export interface DataProviders {
    'paranextExtensionTemplate.quickVerse': ExtensionVerseDataProvider;
  }
}

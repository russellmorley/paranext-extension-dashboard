import 'src/shared/utils/array-manipulations.util';

import { PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import {NamedPairs, NamedPairsInfoContext, NamedPairsInfo, Pair} from './namedpairsinfo.context';
import { AquaService } from "src/shared/services/aqua.service";
//import { IndexedDbPersist } from "./services/indexeddb-persist.service";
//import { httpPapiFrontRequester } from "./utils/http.papifront.requester.util";
import {CurrentVerseContext } from "./currentverse.context";
import { Result } from "paranext-extension-dashboard";
import { VerseRef } from "@sillsdev/scripture";
import { groupBySelector } from 'src/shared/utils/array-manipulations.util';
import { EnvironmentContext } from './environment.context';

export enum Mode {
  VersesForChapter = 1,
  ChaptersForBooks,
  VerseDetails,
}

export function AquaNamedPairsDataContext({ children } : PropsWithChildren) {
  const verseRef = useContext(CurrentVerseContext);
  const environment = useContext(EnvironmentContext);
  if (!environment.requester)
    throw new Error("environment requester must be set for this service");

  const [namedPairsInfo, setNamedPairsInfo] = useState({
    namedPairs: [],
    min: 0,
    max: 0,
    mean: 0,
    standardDeviation: 0,
    pairWithFocus: undefined,
    onPairSelected: (pair:Pair  | undefined) => {}
  } as NamedPairsInfo);
  const [aquaService] = useState(new AquaService(
    'https://fxmhfbayk4.us-east-1.awsapprunner.com/v2',
    {
      // mode: 'no-cors',
      headers: {
        "api_key": "7cf43ae52dw8948ddb663f9cae24488a4",
        // origin: "https://fxmhfbayk4.us-east-1.awsapprunner.com",
      },
      // credentials: "include",
    },
    environment!.requester,
    environment.persist,
  ));
  const [mode, setMode] = useState(Mode.VersesForChapter);

  class SettingsWebviewState {
    assessment_id: string | undefined;
    version_id: string | undefined;
  }
 const settings = window.getWebViewState<SettingsWebviewState>('_settings');
  if (!settings)
    return undefined;
  const assessmentId = settings.assessment_id;
  const versionId = settings.version_id;
  if (!assessmentId || !versionId)
    return undefined;

  const bookFromVerseRef = (verseRef: string | undefined): string | undefined =>
    (verseRef === undefined) ? undefined : new VerseRef(verseRef).book;
  const chapterFromVerseRef = (verseRef: string | undefined): string | undefined =>
    (verseRef === undefined) ? undefined : new VerseRef(verseRef).chapter;
  const verseFromVerseRef = (verseRef: string | undefined): number | undefined =>
    (verseRef === undefined) ? undefined : new VerseRef(verseRef).verseNum;

  const resultsToNamedPairsInfo = (results: Result[]): NamedPairsInfo => {
    let min = 0;
    let max = 0;
    let mean = 0;
    let varianceAccumulator = 0;
    let count = 0;

    const namedPairs = Object
      .entries(groupBySelector(results, (result: Result) => chapterFromVerseRef(result.vref)))
      .map<NamedPairs>(([name, results]) => (
        {
          name: name,
          data: results.map(result => {
            if (result.score) {
              count = count + 1;
              [mean, varianceAccumulator] = adjustMeanAndVarianceAccumulator(result.score, count, mean, varianceAccumulator);
              if (min > result.score)
                min = result.score;
              if (max < result.score)
                max = result.score;
            }
            return {
              x: verseFromVerseRef(result.vref),
              y: result.score
            }})  as [{ x: number; y: number; }]
        } as NamedPairs
      ));
    console.log(`${min} ${max} ${mean} ${varianceAccumulator/(count - 1)} ${count}`);
    console.log(JSON.stringify(namedPairs));
    return {
      namedPairs: namedPairs,
      min: min,
      max: max,
      mean: mean,
      standardDeviation: Math.sqrt(varianceAccumulator / (count - 1)),
      pairWithFocus: {x:1, y:2},
      onPairSelected: onPairSelected
    };
  };

  function adjustMeanAndVarianceAccumulator(newValue: number, count: number, priorMean: number, priorVarianceAccumulator: number) : [number, number] {
    if (count === 1) {
      priorMean = 0;
      priorVarianceAccumulator = 0;
    }
    const newMean = priorMean + (newValue - priorMean)/count;
    const newVarianceAccumulator = priorVarianceAccumulator + (newValue - priorMean)*(newValue - newMean);
    return [newMean, newVarianceAccumulator]
  }


  useEffect(() => {
    async function getResults() {
      try {
        const v = "GEN 1:5";
        const resultsForBook = await aquaService.getResults({assessment_id: parseInt(assessmentId!), book: bookFromVerseRef(v)});
        // console.log("getResults api called");
        if (!ignore) {
          const namedPairsInfo = resultsToNamedPairsInfo(resultsForBook);
          setNamedPairsInfo(namedPairsInfo);
        }
      } catch(e) {
        console.error(e);
      }
    }
    let ignore = false;
    getResults();
    return () => {
      ignore = true;
    }
  }, [verseRef]);

  const onPairSelected = useCallback((pair:Pair  | undefined) => {
    console.log(`x: ${pair?.x}; y:${pair?.y}`);
    // if (!pair && mode === Mode.VersesForChapter) {
    //   setMode(Mode.ChaptersForBooks);

    // }
  }, []);

  return (
    <>
      <NamedPairsInfoContext.Provider value={namedPairsInfo}>
        {children}
      </NamedPairsInfoContext.Provider>
    </>
  );
}

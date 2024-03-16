import 'src/shared/utils/array-manipulations.util';

import { PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import {NamedPairs, NamedPairsInfoContext, NamedPairsInfo, Pair, OnPairSelected} from './namedpairsinfo.context';
import { AquaService } from "src/shared/services/aqua.service";
//import { IndexedDbPersist } from "./services/indexeddb-persist.service";
//import { httpPapiFrontRequester } from "./utils/http.papifront.requester.util";
import {CurrentVerseContext } from "./currentverse.context";
import { Result} from "paranext-extension-dashboard";
import { groupBySelector } from 'src/shared/utils/array-manipulations.util';
import { EnvironmentContext } from './environment.context';
import { AquaMode, AquaStateManager, AquaStatePosition } from './aqua.statemanager';
import { Canon } from '@sillsdev/scripture';

export type NameType = "books" | "chapters";
export type XType = "chapters" | "verses";

export type AquaNamedPairsDataContextParams = {
  stateManager: AquaStateManager;
}

export function AquaNamedPairsDataContext({ children, stateManager } : PropsWithChildren<AquaNamedPairsDataContextParams>) {
  const environment = useContext(EnvironmentContext);
  if (!environment.requester)
    throw new Error("environment requester must be set for this service");

  const [namedPairsInfo, setNamedPairsInfo] = useState({
    id: "",
    namedPairs: [],
    min: 0,
    max: 0,
    mean: 0,
    standardDeviation: 0,
    highlightedPair: undefined,
    onPairSelected: () => {}
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

  const resultsToNamedPairsInfo = (
    results: Result[],
    id: string,
    nameType: NameType,
    xType: XType,
    onPairSelected: OnPairSelected,
    highlightedPair?: Pair): NamedPairsInfo => {

    let min = 0;
    let max = 0;
    let mean = 0;
    let varianceAccumulator = 0;
    let count = 0;

    const namedPairs = Object
      .entries(groupBySelector(results, (result: Result) => nameType === 'chapters' ? AquaStateManager.chapterFromVerseRef(result.vref) : AquaStateManager.bookFromVerseRef(result.vref)))
      .map<NamedPairs>(([name, results]) => (
        {
          name: name,
          number: nameType === 'chapters' ? parseInt(name) : Canon.bookIdToNumber(name),
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
              x: xType === 'verses' ? AquaStateManager.verseNumFromVerseRef(result.vref) : AquaStateManager.chapterNumFromVerseRef(result.vref),
              y: result.score,
              originalDatum: result
            }})  as [Pair]
        } as NamedPairs
      ));
    console.debug(`${min} ${max} ${mean} ${varianceAccumulator/(count - 1)} ${count}`);
    return {
      id: id,
      namedPairs: namedPairs,
      min: min,
      max: max,
      mean: mean,
      standardDeviation: Math.sqrt(varianceAccumulator / (count - 1)),
      highlightedPair: highlightedPair,
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
        if (stateManager.currentState.mode === AquaMode.VerseResultsForBookChapters) {
          const [results, id] = await aquaService.getResults({assessment_id: parseInt(assessmentId!), book: stateManager.currentStateBook});
          if (!ignore) {
            const highlight = stateManager.getHighlight();
            const namedPairsInfo = resultsToNamedPairsInfo(
              results,
              id,
              'chapters',
              'verses',
              onPairSelected,
              highlight && highlight.length > 1 && highlight[1].bookNum && Canon.bookNumberToId(highlight[1].bookNum) === stateManager.currentStateBook ?
                highlight[0] :
                undefined
            );
            setNamedPairsInfo(namedPairsInfo);
          }
        } else if (stateManager.currentState.mode === AquaMode.ChapterResultsForBooks) {
          const [results, id] = await aquaService.getResults({assessment_id: parseInt(assessmentId!), aggregateByChapter: true});
          if (!ignore) {
            const namedPairsInfo = resultsToNamedPairsInfo(
              results,
              id,
              'books',
              'chapters',
              onPairSelected,
              stateManager.getHighlight() ? stateManager.getHighlight()![0] : undefined
            );
            setNamedPairsInfo(namedPairsInfo);
          }
        } else if (stateManager.currentState.mode === AquaMode.VerseDetails) {
          if (!ignore) {

          }
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
  }, [stateManager]);

  const onPairSelected: OnPairSelected = useCallback((pair) => {
    console.debug(`onPairSelected namedPair: ${JSON.stringify(pair)}`);
    if (pair) {
      stateManager.setNextState(pair);
      // setNamedPairsInfo({...namedPairsInfo, namedPairs: {...namedPairsInfo.namedPairs}}); //trigger a redraw in children.
    }
  }, [stateManager]);

  return (
    <>
      <NamedPairsInfoContext.Provider value={namedPairsInfo}>
        {children}
      </NamedPairsInfoContext.Provider>
    </>
  );
}

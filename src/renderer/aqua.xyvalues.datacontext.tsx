import 'src/shared/utils/array-manipulations.util';

import { PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import {XValuesForY, XYValuesInfoInfoContext, XYValuesInfo, XValue, OnXYSelected, XY} from './xyvaluesinfo.context';
import { AquaService } from "src/shared/services/aqua.service";
import { Result} from "paranext-extension-dashboard";
import { groupBySelector } from 'src/shared/utils/array-manipulations.util';
import { EnvironmentContext } from './environment.context';
import { AquaMode, AquaStateManager, AquaStatePosition } from './aqua.statemanager';
import { Canon } from '@sillsdev/scripture';

export type NameType = "books" | "chapters";
export type XType = "chapters" | "verses";

export type AquaXYValuesDataContextParams = {
  stateManager: AquaStateManager;
}

export function AquaXYValuesDataContext({ children, stateManager } : PropsWithChildren<AquaXYValuesDataContextParams>) {
  const environment = useContext(EnvironmentContext);
  if (!environment.requester)
    throw new Error("environment requester must be set for this service");

  const [xyValuesInfo, setXYValuesInfo] = useState({
    id: "",
    xValuesForYs: [],
    min: 0,
    max: 0,
    mean: 0,
    standardDeviation: 0,
    highlightedXY: undefined,
    onXYSelected: () => {}
  } as XYValuesInfo);
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

  const resultsToXYValuesInfo = (
    results: Result[],
    id: string,
    nameType: NameType,
    xType: XType,
    onXYSelected: OnXYSelected,
    highlightedXY?: XY): XYValuesInfo => {

    let min = 0;
    let max = 0;
    let mean = 0;
    let varianceAccumulator = 0;
    let count = 0;

    const xValuesForY = Object
      .entries(groupBySelector(results, (result: Result) => nameType === 'chapters' ? AquaStateManager.chapterFromVerseRef(result.vref) : AquaStateManager.bookFromVerseRef(result.vref)))
      .map<XValuesForY>(([name, results]) => (
        {
          yString: name,
          y: nameType === 'chapters' ? parseInt(name) : Canon.bookIdToNumber(name),
          values: results.map(result => {
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
              value: result.score,
              originalDatum: result
            }})  as [XValue]
        } as XValuesForY
      ));
    console.debug(`${min} ${max} ${mean} ${varianceAccumulator/(count - 1)} ${count}`);
    return {
      id: id,
      xValuesForYs: xValuesForY,
      min: min,
      max: max,
      mean: mean,
      standardDeviation: Math.sqrt(varianceAccumulator / (count - 1)),
      highlightedXY: highlightedXY,
      onXYSelected: onXYSelected
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
            const highlightStatePosition = stateManager.getHighlightStatePosition();
            const highlightXY =
              highlightStatePosition?.bookNum &&
              highlightStatePosition?.chapterNum &&
              highlightStatePosition.verseNum &&
              stateManager.currentStateBook === Canon.bookNumberToId(highlightStatePosition.bookNum) ?
              {y: highlightStatePosition?.chapterNum, x: highlightStatePosition?.verseNum} :
              undefined;

            const xyValuesInfo = resultsToXYValuesInfo(
              results,
              id,
              'chapters',
              'verses',
              onXYSelected,
              highlightXY
            );
            setXYValuesInfo(xyValuesInfo);
          }
        } else if (stateManager.currentState.mode === AquaMode.ChapterResultsForBooks) {
          const [results, id] = await aquaService.getResults({assessment_id: parseInt(assessmentId!), aggregateByChapter: true});
          if (!ignore) {
            const highlightStatePosition = stateManager.getHighlightStatePosition();
            const highlightXY =
              highlightStatePosition?.bookNum &&
              highlightStatePosition.chapterNum ?
              {y: highlightStatePosition?.bookNum, x: highlightStatePosition?.chapterNum} :
              undefined;
            const xyValuesInfo = resultsToXYValuesInfo(
              results,
              id,
              'books',
              'chapters',
              onXYSelected,
              highlightXY
            );
            setXYValuesInfo(xyValuesInfo);
            console.log(JSON.stringify(xyValuesInfo.highlightedXY));
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

  const onXYSelected: OnXYSelected = useCallback((xyOriginalDatum) => {
    console.debug(`OnXYSelected xyOriginalDatum: ${JSON.stringify(xyOriginalDatum)}`);
    if (xyOriginalDatum) {
      // convert from series coordinates to bcv and setNextState.
      if (stateManager.currentState.mode === AquaMode.VerseResultsForBookChapters)
        stateManager.setNextState({chapterNum: xyOriginalDatum.y, verseNum: xyOriginalDatum.x, originalDatum: xyOriginalDatum.originalDatum});
      else if (stateManager.currentState.mode === AquaMode.ChapterResultsForBooks)
        stateManager.setNextState({bookNum: xyOriginalDatum.y} as AquaStatePosition);
      else
        throw new Error(`onXYSelected called even through AquaMode isn't VerseResultsForBookChapters or ChapterResultsForBooks`);
    }
  }, [stateManager]);

  return (
    <>
      <XYValuesInfoInfoContext.Provider value={xyValuesInfo}>
        {children}
      </XYValuesInfoInfoContext.Provider>
    </>
  );
}

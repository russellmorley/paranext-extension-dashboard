import { groupBySelector } from 'src/shared/utils/array-manipulations.util';

import { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { AquaService } from 'src/shared/services/aqua.service';
import type { Result } from 'paranext-extension-dashboard';
import { Canon } from '@sillsdev/scripture';
import { Spinner } from '@chakra-ui/react';
import { EnvironmentContext } from './environment.context';
import { AquaMode, AquaStateManager } from './aqua.statemanager';
import {
  XValuesForY,
  XYValuesInfoInfoContext,
  XYValuesInfo,
  XValue,
  OnXYSelected,
  XY,
} from './xyvaluesinfo.context';
import { logger } from '@papi/frontend';

export type NameType = 'books' | 'chapters';
export type XType = 'chapters' | 'verses';

export type AquaXYValuesDataContextParams = {
  stateManager: AquaStateManager;
};

export function AquaXYValuesDataContext({
  children,
  stateManager,
}: PropsWithChildren<AquaXYValuesDataContextParams>) {
  const environment = useContext(EnvironmentContext);
  if (!environment.requester) throw new Error('environment requester must be set for this service');

  const [isLoading, setIsLoading] = useState(false);

  const [xyValuesInfo, setXYValuesInfo] = useState<XYValuesInfo>({
    id: '',
    xValuesForYs: [],
    min: 0,
    max: 0,
    mean: 0,
    standardDeviation: 0,
    highlightedXY: undefined,
    onXYSelected: () => {},
  });
  const [aquaService] = useState(
    new AquaService(
      'https://fxmhfbayk4.us-east-1.awsapprunner.com/v2',
      {
        // mode: 'no-cors',
        headers: {
          api_key: '7cf43ae52dw8948ddb663f9cae24488a4',
          // origin: "https://fxmhfbayk4.us-east-1.awsapprunner.com",
        },
        // credentials: "include",
      },
      environment.requester,
      environment.persist,
    ),
  );

  class SettingsWebviewState {
    assessmentId: string | undefined;
    versionId: string | undefined;
  }
  const settings = window.getWebViewState<SettingsWebviewState>('_settings', {
    assessmentId: undefined,
    versionId: undefined,
  });
  const { assessmentId } = settings;

  function adjustMeanAndVarianceAccumulator(
    newValue: number,
    count: number,
    priorMean: number,
    priorVarianceAccumulator: number,
  ): [number, number] {
    if (count === 1) {
      // eslint-disable-next-line no-param-reassign
      priorMean = 0;
      // eslint-disable-next-line no-param-reassign
      priorVarianceAccumulator = 0;
    }
    const newMean = priorMean + (newValue - priorMean) / count;
    const newVarianceAccumulator =
      priorVarianceAccumulator + (newValue - priorMean) * (newValue - newMean);
    return [newMean, newVarianceAccumulator];
  }

  const onXYSelected: OnXYSelected = useCallback(
    (xyOriginalDatum) => {
      logger.debug(`OnXYSelected xyOriginalDatum: ${JSON.stringify(xyOriginalDatum)}`);
      if (xyOriginalDatum) {
        // convert from series coordinates to bcv and setNextState.
        if (stateManager.currentState.mode === AquaMode.VerseResultsForBookChapters)
          stateManager.setNextState({
            chapterNum: xyOriginalDatum.y,
            verseNum: xyOriginalDatum.x,
            originalDatum: xyOriginalDatum.originalDatum,
          });
        else if (stateManager.currentState.mode === AquaMode.ChapterResultsForBooks)
          stateManager.setNextState({ bookNum: xyOriginalDatum.y });
        else
          throw new Error(
            `onXYSelected called even through AquaMode isn't VerseResultsForBookChapters or ChapterResultsForBooks`,
          );
      }
    },
    [stateManager],
  );

  useEffect(() => {
    const resultsToXYValuesInfo = (
      results: Result[],
      id: string,
      nameType: NameType,
      xType: XType,
      onXYSelectedValue: OnXYSelected,
      highlightedXY?: XY,
    ): XYValuesInfo => {
      let min = 0;
      let max = 0;
      let mean = 0;
      let varianceAccumulator = 0;
      let count = 0;

      const xValuesForY = Object.entries(
        groupBySelector(results, (result: Result) =>
          nameType === 'chapters'
            ? AquaStateManager.chapterFromVerseRef(result.vref)
            : AquaStateManager.bookFromVerseRef(result.vref),
        ),
      ).map<XValuesForY>(([name, relevantResults]) => ({
        yString: name,
        y: nameType === 'chapters' ? parseInt(name, 10) : Canon.bookIdToNumber(name),
        values: relevantResults.map<XValue>((result) => {
          if (result.score) {
            count += 1;
            [mean, varianceAccumulator] = adjustMeanAndVarianceAccumulator(
              result.score,
              count,
              mean,
              varianceAccumulator,
            );
            if (min > result.score) min = result.score;
            if (max < result.score) max = result.score;
          }
          // Figure out what to do with potentially undefined values below
          /* eslint-disable no-type-assertion/no-type-assertion */
          return {
            x:
              xType === 'verses'
                ? AquaStateManager.verseNumFromVerseRef(result.vref)!
                : AquaStateManager.chapterNumFromVerseRef(result.vref)!,
            value: result.score!,
            originalDatum: result,
          };
          /* eslint-enable no-type-assertion/no-type-assertion */
        }),
      }));
      logger.debug(`${min} ${max} ${mean} ${varianceAccumulator / (count - 1)} ${count}`);
      return {
        id,
        xValuesForYs: xValuesForY,
        min,
        max,
        mean,
        standardDeviation: Math.sqrt(varianceAccumulator / (count - 1)),
        highlightedXY,
        onXYSelected: onXYSelectedValue,
      };
    };

    let ignore = false;
    async function getResults() {
      try {
        if (!isLoading) setIsLoading(true);
        if (stateManager.currentState.mode === AquaMode.VerseResultsForBookChapters) {
          const [results, id] = await aquaService.getResults({
            // eslint-disable-next-line no-type-assertion/no-type-assertion
            assessmentId: parseInt(assessmentId!, 10),
            book: stateManager.currentStateBook,
          });
          if (!ignore) {
            const highlightStatePosition = stateManager.getHighlightStatePosition();
            const highlightXY =
              highlightStatePosition?.bookNum &&
              highlightStatePosition?.chapterNum &&
              highlightStatePosition.verseNum &&
              stateManager.currentStateBook === Canon.bookNumberToId(highlightStatePosition.bookNum)
                ? { y: highlightStatePosition?.chapterNum, x: highlightStatePosition?.verseNum }
                : undefined;

            setXYValuesInfo(
              resultsToXYValuesInfo(results, id, 'chapters', 'verses', onXYSelected, highlightXY),
            );
          }
        } else if (stateManager.currentState.mode === AquaMode.ChapterResultsForBooks) {
          const [results, id] = await aquaService.getResults({
            // eslint-disable-next-line no-type-assertion/no-type-assertion
            assessmentId: parseInt(assessmentId!, 10),
            aggregateByChapter: true,
          });
          if (!ignore) {
            const highlightStatePosition = stateManager.getHighlightStatePosition();
            const highlightXY =
              highlightStatePosition?.bookNum && highlightStatePosition.chapterNum
                ? { y: highlightStatePosition?.bookNum, x: highlightStatePosition?.chapterNum }
                : undefined;
            setXYValuesInfo(
              resultsToXYValuesInfo(results, id, 'books', 'chapters', onXYSelected, highlightXY),
            );
            logger.log(JSON.stringify(xyValuesInfo.highlightedXY));
          }
        } else if (stateManager.currentState.mode === AquaMode.VerseDetails) {
          if (!ignore) {
            // Not sure why this is empty
          }
        }
      } catch (e) {
        logger.error(e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    getResults();
    return () => {
      ignore = true;
    };
  }, [
    aquaService,
    assessmentId,
    isLoading,
    onXYSelected,
    xyValuesInfo.highlightedXY,
    stateManager,
  ]);

  return (
    <XYValuesInfoInfoContext.Provider value={xyValuesInfo}>
      {isLoading ? <Spinner /> : children}
    </XYValuesInfoInfoContext.Provider>
  );
}

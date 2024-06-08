import * as React from 'react';
import { useContext, useState } from 'react';
import { Canon } from '@sillsdev/scripture';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  ChakraProvider,
  Text,
} from '@chakra-ui/react';
import { AquaXYValuesDataContext } from './aqua.xyvalues.datacontext';
import { ChartsFromXYValuesComponent } from './charts.xyvalues.component';
import { DisplayFromTokensTextRowsComponent } from './display.tokenstextrows.component';
import { AquaMode, AquaState, AquaStateManager } from './aqua.statemanager';
import { CurrentVerseContext } from './currentverse.context';
import { HeatmapAscendingXYValues } from './chart.xyvalues';
import { AquaTokenTextRowsDataContext } from './aqua.tokenstextrows.datacontext';

type Visualization = {
  header?: React.JSX.Element;
  body: React.JSX.Element;
  footer?: React.JSX.Element;
};

// eslint-disable-next-line import/prefer-default-export
export function AquaAppComponent() {
  const verseRef = useContext(CurrentVerseContext);

  const [aquaState, setAquaState] = useState<AquaState>(
    verseRef.length > 0
      ? {
          mode: AquaMode.VerseResultsForBookChapters,
          statePosition: { bookNum: AquaStateManager.bookNumFromVerseRef(verseRef) },
          verseRef,
        }
      : { mode: AquaMode.ChapterResultsForBooks, statePosition: {}, verseRef },
  );

  const setState = (state: {}) => {
    // Asserting the type that should already be known from `useState` above
    // eslint-disable-next-line no-type-assertion/no-type-assertion
    setAquaState(state as AquaState);
  };
  const aquaStateManager = new AquaStateManager(aquaState, setState, verseRef);

  const chartsVisualization = {
    header: undefined,
    body: (
      <AquaXYValuesDataContext stateManager={aquaStateManager}>
        <ChartsFromXYValuesComponent
          chartXYValues={new HeatmapAscendingXYValues()}
          initialSliderPositionsStdDeviationMultiple={4}
          tooltipFormatter={({ series, seriesIndex, dataPointIndex, w }) => {
            const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
            return `<div class="arrow_box">
                  <div class="verse"><span>${data.originalDatum?.vref}</span></div>
                  <div class="score"><span>Score: ${series[seriesIndex][dataPointIndex]}</span></div>
                  ${data.originalDatum?.revision_text ? `<div class="text"><span>Text: ${data.originalDatum?.revision_text}</span></div>` : ''}
                  ${data.originalDatum?.reference_text ? `<div class="revision_text"><span>Reference text: ${data.originalDatum?.reference_text}</span></div>` : ''}
                `;
          }}
        />
      </AquaXYValuesDataContext>
    ),
    footer: undefined,
  };

  const parallelTextVisualization = {
    header: undefined,
    body: (
      <Text fontSize="2xl">
        <AquaTokenTextRowsDataContext
          corpusId="123"
          corpusName="RSV English"
          verseTexts={[
            {
              verseRef: aquaStateManager.currentState.statePosition.originalDatum?.vref,
              text: aquaStateManager.currentState.statePosition.originalDatum?.revision_text,
            },
          ]}
        >
          <DisplayFromTokensTextRowsComponent />
        </AquaTokenTextRowsDataContext>
        {aquaStateManager.currentState.statePosition.originalDatum?.reference_text ? (
          <>
            <br />
            <hr />
            <AquaTokenTextRowsDataContext
              corpusId="456"
              corpusName="Mwaghavul"
              verseTexts={[
                {
                  verseRef: aquaStateManager.currentState.statePosition.originalDatum?.vref,
                  text: aquaStateManager.currentState.statePosition.originalDatum?.reference_text,
                },
              ]}
            >
              <DisplayFromTokensTextRowsComponent />
            </AquaTokenTextRowsDataContext>
          </>
        ) : // eslint-disable-next-line no-null/no-null
        null}
      </Text>
    ),
    footer: undefined,
  };

  let visualization: Visualization;
  if (aquaState.mode !== AquaMode.VerseDetails) {
    visualization = chartsVisualization;
  } else {
    visualization = parallelTextVisualization;
  }

  return (
    <ChakraProvider>
      <Card>
        <Text fontSize="3xl">
          {`${aquaState.statePosition.bookNum ? Canon.bookNumberToEnglishName(aquaState.statePosition.bookNum) : ''} ${aquaState.statePosition.chapterNum ? aquaState.statePosition.chapterNum : ''}${aquaState.statePosition.verseNum ? `:${aquaState.statePosition.verseNum}` : ''}`}
        </Text>
      </Card>
      <Card>
        <CardHeader>
          {aquaState.mode !== AquaMode.ChapterResultsForBooks && (
            <Button onClick={() => aquaStateManager.setPriorState()}>Zoom out</Button>
          )}
        </CardHeader>
        <CardBody>{visualization.body}</CardBody>
        <CardFooter>
          <Text fontSize="sm">(c) Biblica</Text>
        </CardFooter>
      </Card>
    </ChakraProvider>
  );
}

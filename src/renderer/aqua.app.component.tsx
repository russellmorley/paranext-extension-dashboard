import { useContext, useState } from "react";
import { AquaXYValuesDataContext } from "./aqua.xyvalues.datacontext";
import { ChartsFromXYValuesComponent } from "./charts.xyvalues.component";
import { DisplayFromTokensTextRowsComponent } from "./display.tokenstextrows.component";
import { AquaMode, AquaState, AquaStateManager } from "./aqua.statemanager";
import { CurrentVerseContext } from "./currentverse.context";
import { Canon } from "@sillsdev/scripture";
import { HeatmapAscendingXYValues } from "./chart.xyvalues";

import { ChakraProvider } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { AquaTokenTextRowsDataContext } from "./aqua.tokenstextrows.datacontext";

type Visualization = {
  header?: JSX.Element,
  body: JSX.Element,
  footer?: JSX.Element,
}

export function AquaAppComponent() {
  const verseRef = useContext(CurrentVerseContext);

  const [aquaState, setAquaState] = useState(verseRef.length > 0 ?
    {mode: AquaMode.VerseResultsForBookChapters, statePosition: {bookNum: AquaStateManager.bookNumFromVerseRef(verseRef)}, verseRef: verseRef} as AquaState:
    {mode: AquaMode.ChapterResultsForBooks, statePosition: {}, verseRef} as AquaState);

  const setState = (state: {}) => {
    setAquaState(state as AquaState);
  }
  const aquaStateManager = new AquaStateManager(aquaState, setState, verseRef);

  const chartsVisualization = {
    header:
      undefined,
    body:
      <AquaXYValuesDataContext stateManager={aquaStateManager}>
        <ChartsFromXYValuesComponent
          chartXYValues={new HeatmapAscendingXYValues()}
          initialSliderPositionsStdDeviationMultiple={4}
          tooltipFormatter={
            ({series, seriesIndex, dataPointIndex, w}) => {
              var data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                return `<div class="arrow_box">
                  <div class="verse"><span>${data.originalDatum?.vref}</span></div>
                  <div class="score"><span>Score: ${series[seriesIndex][dataPointIndex]}</span></div>
                  ${data.originalDatum?.revision_text ? `<div class="text"><span>Text: ${data.originalDatum?.revision_text}</span></div>` : ''}
                  ${data.originalDatum?.reference_text ? `<div class="revision_text"><span>Reference text: ${data.originalDatum?.reference_text}</span></div>` : ''}
                `
            }}/>
      </AquaXYValuesDataContext>,
    footer: undefined};

  const parallelTextVisualization = {
    header: undefined,
    body:
      <Text fontSize='2xl'>
        <AquaTokenTextRowsDataContext verseTexts={[{
          verseRef: aquaStateManager.currentState.statePosition.originalDatum?.vref,
          text: aquaStateManager.currentState.statePosition.originalDatum?.revision_text}]}>
          <DisplayFromTokensTextRowsComponent />
        </AquaTokenTextRowsDataContext>
      { aquaStateManager.currentState.statePosition.originalDatum?.reference_text
      ?
        <AquaTokenTextRowsDataContext verseTexts={[{
          verseRef: aquaStateManager.currentState.statePosition.originalDatum?.vref,
          text: aquaStateManager.currentState.statePosition.originalDatum?.reference_text}]}>
          <DisplayFromTokensTextRowsComponent />
        </AquaTokenTextRowsDataContext>
      :
        null}
      </Text>,
    footer: undefined};


  let visualization: Visualization;
  if (aquaState.mode !== AquaMode.VerseDetails) {
    visualization = chartsVisualization;
  } else {
    visualization = parallelTextVisualization;
  }

  return (
    <ChakraProvider>
      <Card>
        <Text fontSize='3xl'>
            {`${aquaState.statePosition.bookNum ? Canon.bookNumberToEnglishName(aquaState.statePosition.bookNum) : ''} ${aquaState.statePosition.chapterNum ? aquaState.statePosition.chapterNum : ''}${aquaState.statePosition.verseNum ? `:${aquaState.statePosition.verseNum}` : ''}`}
        </Text>
      </ Card>
      <Card>
        <CardHeader>
          {aquaState.mode !== AquaMode.ChapterResultsForBooks && (
            <Button onClick={() => aquaStateManager.setPriorState()}>Zoom out</Button>
          )}
        </CardHeader>
        <CardBody>
          {visualization.body}
        </CardBody>
        <CardFooter>
          <Text fontSize='sm'>
          (c) Biblica
          </Text>
        </CardFooter>
      </ Card>
    </ChakraProvider>
  );
}

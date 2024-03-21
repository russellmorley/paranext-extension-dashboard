import { useContext, useState } from "react";
import { AquaNamedPairsDataContext } from "./aqua.namedpairs.datacontext";
import { ChartsFromNamedPairsComponent } from "./charts.namedpairs.component";
import { DashboardVersesDataContext } from "./dashboard.verses.datacontext";
import { TokenDisplayFromVersesComponent } from "./tokendisplay.verses.component";
import { AquaMode, AquaState, AquaStateManager } from "./aqua.statemanager";
import { CurrentVerseContext } from "./currentverse.context";
import { Canon } from "@sillsdev/scripture";
import { HeatmapAscendingNamedPairs } from "./chart.namedpairs";

import { ChakraProvider } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { AquaVersesDataContext } from "./aqua.verses.datacontext";

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
      <AquaNamedPairsDataContext stateManager={aquaStateManager}>
        <ChartsFromNamedPairsComponent
          chartNamedPairs={new HeatmapAscendingNamedPairs()}
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
      </AquaNamedPairsDataContext>,
    footer: undefined};

  const parallelTextVisualization = {
    header: undefined,
    body:
      <Text fontSize='2xl'>
        <AquaVersesDataContext verseTexts={[{verseRef: "GEN 1:1", text: "how are you?"}]}>
          <TokenDisplayFromVersesComponent />
        </AquaVersesDataContext>
      { true
      ?
        <AquaVersesDataContext verseTexts={[{verseRef: "GEN 1:2", text: "I am fine!"}]}>
          <TokenDisplayFromVersesComponent />
        </AquaVersesDataContext>
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
          <Button onClick={() => aquaStateManager.setPriorState()}>Back</Button>
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

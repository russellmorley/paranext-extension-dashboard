import { useContext, useState } from "react";
import { AquaNamedPairsDataContext } from "./aqua.namedpairs.datacontext";
import { ChartsFromNamedPairs } from "./charts.namedpairs.component";
import { DashboardVersesDataContext } from "./dashboard.verses.datacontext";
import { VerseTextFromVerses } from "./versetext.verses.component";
import { AquaMode, AquaState, AquaStateManager } from "./aqua.statemanager";
import { CurrentVerseContext } from "./currentverse.context";
import { Canon } from "@sillsdev/scripture";
import { HeatmapAscendingNamedPairs } from "./heatmap.namedpairs";

export function ComponentList() {
  const verseRef = useContext(CurrentVerseContext);

  const [aquaState, setAquaState] = useState(verseRef.length > 0 ?
    {mode: AquaMode.VerseResultsForBookChapters, statePosition: {bookNum: AquaStateManager.bookNumFromVerseRef(verseRef)}, verseRef: verseRef} as AquaState:
    {mode: AquaMode.ChapterResultsForBooks, statePosition: {}, verseRef} as AquaState);

  const setState = (state: {}) => {
    setAquaState(state as AquaState);
  }
  const aquaStateManager = new AquaStateManager(aquaState, setState, verseRef);

  return (
    <>
      <div className="item">
        <button onClick={() => aquaStateManager.setPriorState()}>Back</button>
        Current Verse Context:
          {`${aquaState.statePosition.bookNum ? Canon.bookNumberToId(aquaState.statePosition.bookNum) : '<not set>'} ${aquaState.statePosition.chapterNum ? aquaState.statePosition.chapterNum : ''}${aquaState.statePosition.verseNum ? `:${aquaState.statePosition.verseNum}` : ''}`}
        <AquaNamedPairsDataContext stateManager={aquaStateManager}>
          <ChartsFromNamedPairs
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
        </AquaNamedPairsDataContext>
      </ div>
      <div className="item">
        <DashboardVersesDataContext>
          <VerseTextFromVerses />
        </DashboardVersesDataContext>
      </ div>
    </>
  );
}

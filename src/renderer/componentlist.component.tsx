import { useContext, useState } from "react";
import { AquaNamedPairsDataContext } from "./aqua.namedpairs.datacontext";
import { ChartsFromNamedPairs } from "./charts.namedpairs.component";
import { DashboardVersesDataContext } from "./dashboard.verses.datacontext";
import { VerseTextFromVerses } from "./versetext.verses.component";
import { AquaMode, AquaState, AquaStateManager } from "./aqua.statemanager";
import { CurrentVerseContext } from "./currentverse.context";
import { Canon } from "@sillsdev/scripture";

export function ComponentList() {
  const verseRef = useContext(CurrentVerseContext);

  const [aquaState, setAquaState] = useState(verseRef.length > 0 ?
    {mode: AquaMode.VerseResultsForBookChapters, position: {bookNum: AquaStateManager.bookNumFromVerseRef(verseRef)}, verseRef: verseRef} as AquaState:
    {mode: AquaMode.ChapterResultsForBooks, position: {}, verseRef} as AquaState);

  const setState = (state: {}) => {
    setAquaState(state as AquaState);
  }
  const aquaStateManager = new AquaStateManager(aquaState, setState, verseRef);

  return (
    <>
      <div className="item">
        <button onClick={() => aquaStateManager.setPriorState()}>Back</button>
        Current Verse Context:
          {`${aquaState.position.bookNum ? Canon.bookNumberToId(aquaState.position.bookNum) : '<not set>'} ${aquaState.position.chapterNum ? aquaState.position.chapterNum : ''}${aquaState.position.verseNum ? `:${aquaState.position.verseNum}` : ''}`}
        <AquaNamedPairsDataContext stateManager={aquaStateManager}>
          <ChartsFromNamedPairs initialSliderPositionsStdDeviationMultiple={4}/>
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

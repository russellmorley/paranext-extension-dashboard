import { AquaNamedPairsDataContext } from "./aqua.namedpairs.datacontext";
import { ChartsFromNamedPairs } from "./charts.namedpairs.component";
import { DashboardVersesDataContext } from "./dashboard.verses.datacontext";
import { VerseTextFromVerses } from "./versetext.verses.component";

export function ComponentList() {

  return (
    <>
      <div className="item">
        <AquaNamedPairsDataContext>
          <ChartsFromNamedPairs />
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

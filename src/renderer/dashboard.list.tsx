import { AquaNamedPairsDataContext } from "./aqua.namedpairs.datacontext";
import { AquaNamedPairsToCharts } from "./aqua.namedpairs.charts";
import { DashboardVersesDataContext } from "./dashboard.verses.datacontext";
import { DashboardVersesVerseRangeDisplay } from "./dashboard.verses.verserangedisplay";

export function DashboardList() {

  return (
    <>
      <div className="item">
        <AquaNamedPairsDataContext>
          <AquaNamedPairsToCharts />
        </AquaNamedPairsDataContext>
      </ div>
      <div className="item">
        <DashboardVersesDataContext>
          <DashboardVersesVerseRangeDisplay />
        </DashboardVersesDataContext>
      </ div>
    </>
  );
}

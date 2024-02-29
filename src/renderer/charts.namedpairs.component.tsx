import { useContext, useState } from "react";
import {NamedPairs, NamedPairsContext} from './namedpairs.context';
import { ApexOptions } from "apexcharts";
import Chart from 'react-apexcharts';
import { CurrentVerseContext } from "./currentverse.context";
import papi from "@papi/frontend";
import { DualSlider } from "./dualslider.component";
import { VerseRef } from "@sillsdev/scripture";



export function ChartsFromNamedPairs() {
  const namedPairsCollection = useContext(NamedPairsContext);
  const verseRef = useContext(CurrentVerseContext);
  const [leftSliderPosition, setLeftSliderPosition] = useState(.99);
  const [rightSliderPosition, setRightSliderPosition] = useState(1);

  const [chartOptions, setChartOptions] = useState({
    plotOptions: {
      heatmap: {
        radius: 2,
        enableShades: true,
        colorScale: {
          ranges: [
            {
              from: -1,
              to: 0,
              color: "#ffffff",
              opacity: "0%",
              name: 'not included',
            },
            {
              from: 0.00000001,
              to: .3,
              color: '#FF0000',
              name: 'low',
            },
            {
              from: .3000000001,
              to: .7,
              color: '#0000FF',
              name: 'medium',
            },
            {
              from: .7000000001,
              to: 1,
              color: '#008000',
              name: 'high',
            }
          ]
        }
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    labels: Array.from(new Array(100), (_, i) => (i + 1).toString()),
    xaxis: {
      labels: {
        show: true,
        hideOverlappingLabels: false,
        showDuplicates: true,
      }
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        show: false,
        formatter: (value, {series, seriesIndex, dataPointIndex, w}) => `Chapter: ${ w.globals.labels[seriesIndex]}, Verse: ${ w.globals.labels[dataPointIndex]}, Score: ${value}`,
      }
    },
  } as ApexOptions);

  //  const verseFromVerseRef = (verseRef: string | undefined): string | undefined =>
  //   (verseRef === undefined) ? undefined : new VerseRef(verseRef).verse;
  //  const noVerseFromVref = namedPairsCollection.map(namedPairs => namedPairs.data.filter(pair => !pair.x || pair.x.length < 1));

  function rangeFilter(
    leftPostion: number,
    rightPosition: number,
    namedPairsCollection: NamedPairs[]): NamedPairs[] {
      return namedPairsCollection.map(namedPairs => ({
        name: namedPairs.name,
        data: namedPairs.data.map(pair => ({
          x: pair.x,
          y: pair.y >= rightPosition || pair.y <= leftPostion ? pair.y : -1
        }))
      })) as NamedPairs[];
  }
  return (
    <>
      <div> Verse: {verseRef}</div>
      <div>
        <span>Min: {leftSliderPosition}</span>&nbsp;<span>Max: {rightSliderPosition}</span>
      </div>
      <div>
        <DualSlider
          min={0}
          max={1}
          notInRangeColor={"#dadae5"}
          inRangeColor={"#3264fe"}
          leftSliderPosition={leftSliderPosition}
          rightSliderPosition={rightSliderPosition}
          minimumGap={.01}
          step={.01}
          onRangeChanged={
            (leftPosition: number, rightPosition: number): void => {
              setLeftSliderPosition(leftPosition);
              setRightSliderPosition(rightPosition);
            }
          }
        />
      </div>
      <div>
        <Chart options={chartOptions} series={rangeFilter(leftSliderPosition, rightSliderPosition, namedPairsCollection)} type="heatmap" height={800} />
      </div>
      <div>
        <button
          onClick={async () => {
            const start = performance.now();
            const result = await papi.commands.sendCommand(
              'platform.paranextVerseChange',
              'GEN 100:2000',
              1,
            );
          }}
        >
            Trigger verse change from paranext
        </button>
      </div>
    </>
  );
}

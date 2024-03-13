import { useContext, useEffect, useState } from "react";
import {NamedPairs, NamedPairsInfo, NamedPairsInfoContext} from './namedpairsinfo.context';
import { ApexOptions } from "apexcharts";
import Chart from 'react-apexcharts';
import { CurrentVerseContext } from "./currentverse.context";
import { DualSlider } from "./dualslider.component";

// remove once testing complete
import papi from "@papi/frontend";

export enum SliderMode {
  Ranges = 1,
  OutsideRange
};

export type ChartProps = {
  initialSliderPositionsStdDeviationMultiple?: number
  initialSliderMode?: SliderMode,
  baseChartOptions?: ApexOptions,
  lowColor?: string,
  mediumColor?: string,
  highColor?: string
}

const leftSliderInitialPosition = -1;
const rightSliderInitialPosition = -1;
const minimumSliderGap = .01;
const sliderStep = .01;

export function ChartsFromNamedPairs({
  initialSliderPositionsStdDeviationMultiple = 3,
  initialSliderMode = SliderMode.OutsideRange,
  lowColor = "#FF0000",
  mediumColor = "#FFFF00",
  highColor = "#0000FF",
  baseChartOptions = {
    plotOptions: {
      heatmap: {
        radius: 2,
        enableShades: true,
        shadeIntensity: 1,
        colorScale: {
          ranges: [
             {
              from: 0,
              to: .3,
              color: '#FF0000',
              name: 'low',
            },
            {
              from: .3000000001,
              to: .7,
              color: '#FFFF00',
              name: 'medium',
            },
            {
              from: .7000000001,
              to: 1,
              color: '#00FF00',
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
        show: false,
        //hideOverlappingLabels: false,
        //showDuplicates: true,
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
  } as ApexOptions
} : ChartProps) {
  const namedPairsInfo = useContext(NamedPairsInfoContext);
  const verseRef = useContext(CurrentVerseContext);
  const [leftSliderPosition, setLeftSliderPosition] = useState(leftSliderInitialPosition);
  const [rightSliderPosition, setRightSliderPosition] = useState(rightSliderInitialPosition);
  const [sliderMode, setSliderMode] = useState(initialSliderMode);

  // const [chartOptions, setChartOptions] = useState({} as ApexOptions);

  function getChartOptions(chartOptions: ApexOptions, min: number, max: number, leftSliderPosition: number, rightSliderPosition: number): ApexOptions {
    const colorScale = chartOptions.plotOptions?.heatmap?.colorScale;
    if (colorScale)
      colorScale.ranges= [
        {
          from: -100000,
          to: min - .0000001,
          color: '#FFFFFF',
          name: 'not shown',
        },
        {
          from: min,
          to: leftSliderPosition - .0000001,
          color: lowColor,
          name: 'low',
        },
        {
          from: leftSliderPosition,
          to: rightSliderPosition - .0000001,
          color: mediumColor,
          name: 'average',
        },
        {
          from: rightSliderPosition,
          to: max,
          color: highColor,
          name: 'high',
        },
      ];
    return {...chartOptions};
  }

  if (namedPairsInfo.standardDeviation !== 0 && leftSliderPosition === leftSliderInitialPosition) {
    setLeftSliderPosition(namedPairsInfo.mean - namedPairsInfo.standardDeviation * initialSliderPositionsStdDeviationMultiple / 2);
    if (sliderMode === SliderMode.OutsideRange)
      setRightSliderPosition(namedPairsInfo.max - sliderStep);
    else
      setRightSliderPosition(namedPairsInfo.mean + namedPairsInfo.standardDeviation * initialSliderPositionsStdDeviationMultiple / 2);
  }

  //  const verseFromVerseRef = (verseRef: string | undefined): string | undefined =>
  //   (verseRef === undefined) ? undefined : new VerseRef(verseRef).verse;
  //  const noVerseFromVref = namedPairsCollection.map(namedPairs => namedPairs.data.filter(pair => !pair.x || pair.x.length < 1));

  function rangeFilter(
    min: number,
    leftPosition: number,
    rightPosition: number,
    namedPairsCollection: NamedPairs[]) {
      if (sliderMode === SliderMode.OutsideRange)
        return namedPairsCollection.map(namedPairs => ({
          name: namedPairs.name,
          data: namedPairs.data.map(pair => ({
            x: pair.x.toString(),
            y: pair.y >= rightPosition || pair.y <= leftPosition ? pair.y : min - 1
          }))
        }));
      else
        return namedPairsCollection.map(namedPairs => ({
          name: namedPairs.name,
          data: namedPairs.data.map(pair => ({
            x: pair.x.toString(),
            y: pair.y
          }))
        }));
  }

  useEffect(() => {
    // mark the focused cell
    const item = document.querySelector(`.apexcharts-heatmap-rect[i='${namedPairsInfo.pairWithFocus?.x.toString()}'][j='${namedPairsInfo.pairWithFocus?.y.toString()}']`);
    if (item) {
      (item as HTMLElement).style.fill = "white";
      console.debug(`found element class '.apexcharts-heatmap-rect' with i=${namedPairsInfo.pairWithFocus?.x.toString()} and j=${namedPairsInfo.pairWithFocus?.y.toString()}`);
    } else {
      console.error(`couldn't find element class '.apexcharts-heatmap-rect' with i=${namedPairsInfo.pairWithFocus?.x.toString()} and j=${namedPairsInfo.pairWithFocus?.y.toString()}`);
    }
    // add event handlers to each cell so parent can be informed when a Pair (cell) is clicked.
    document.querySelectorAll(`.apexcharts-heatmap-rect`).forEach(element => element.addEventListener('click', (event) => {
      const x = parseInt((event.target as HTMLElement).getAttribute('i') ?? '-1');
      const y = parseInt((event.target as HTMLElement).getAttribute('j') ?? '-1');
      if (x > -1 && y > -1)
        namedPairsInfo.onPairSelected({x:x, y:y});
    }));
  });

  return (
    <>
      <div> Verse: {verseRef}</div>
      <div>
        <span>Min: {Math.round(namedPairsInfo.min * 1000) / 1000}</span>&nbsp;
        <span>Max: {Math.round(namedPairsInfo.max * 1000) / 1000}</span>&nbsp;
        <span>Mean: {Math.round(namedPairsInfo.mean * 1000) / 1000}</span>&nbsp;
        <span>Standard Deviation: {Math.round(namedPairsInfo.standardDeviation * 1000) / 1000}</span>&nbsp;
        {/* <span>Outliers beyond {outliersBeyondStdDeviationMultiple} times standard deviation.</span> */}
      </div>
      <div>
        <span>
          <button onClick={() => sliderMode === SliderMode.OutsideRange ? setSliderMode(SliderMode.Ranges) : setSliderMode(SliderMode.OutsideRange)}>{sliderMode === SliderMode.OutsideRange ? 'Outside Range' : 'Range'}</button>&nbsp;
          <span>Left Slider Position: {leftSliderPosition}</span>&nbsp;
          <span>Right Slider Position: {rightSliderPosition}</span>
        </span>
      </div>
      <div>
        <DualSlider
          min={namedPairsInfo.min}
          max={namedPairsInfo.max}
          notInRangeColor={"#dadae5"}
          inRangeColor={"#3264fe"}
          leftSliderPosition={leftSliderPosition}
          rightSliderPosition={rightSliderPosition}
          minimumGap={minimumSliderGap}
          step={sliderStep}
          onRangeChanged={
            (leftPosition: number, rightPosition: number): void => {
              setLeftSliderPosition(leftPosition);
              setRightSliderPosition(rightPosition);
            }
          }
        />
      </div>
      <div>
        <Chart options={getChartOptions(baseChartOptions, namedPairsInfo.min, namedPairsInfo.max, leftSliderPosition, rightSliderPosition)} series={rangeFilter(namedPairsInfo.min, leftSliderPosition, rightSliderPosition, namedPairsInfo.namedPairs)} type="heatmap" height={800} />
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

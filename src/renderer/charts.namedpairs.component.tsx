import { useContext, useEffect, useState } from "react";
import {NamedPairs, NamedPairsInfo, NamedPairsInfoContext, Pair} from './namedpairsinfo.context';
import { ApexOptions } from "apexcharts";
import Chart from 'react-apexcharts';
import { DualSlider } from "./dualslider.component";
import { ChartNamedPairs } from "./heatmap.namedpairs";

export enum SliderMode {
  Ranges = 1,
  OutsideRange
};

type ChartState = {
  leftSliderPosition: number,
  rightSliderPosition: number,
  sliderMode: SliderMode,
  namedPairsInfoId: string
};

export type ChartProps = {
  chartNamedPairs: ChartNamedPairs,
  highlightedPair?: Pair,
  initialSliderPositionsStdDeviationMultiple?: number,
  initialSliderMode?: SliderMode,
  baseChartOptions?: ApexOptions,
  leftColor?: string,
  middleColor?: string,
  rightColor?: string,
  tooltipFormatter?: (props: any) => string
}

const leftSliderInitialPosition = -1;
const rightSliderInitialPosition = -1;
const minimumSliderGap = .01;
const sliderStep = .01;

export function ChartsFromNamedPairs({
  chartNamedPairs,
  initialSliderPositionsStdDeviationMultiple = 3,
  initialSliderMode = SliderMode.Ranges,
  leftColor = "#FF0000",
  middleColor = "#FFFF00",
  rightColor = "#0000FF",
  tooltipFormatter = ({series, seriesIndex, dataPointIndex, w}): string =>
    `<div class="arrow_box">
      <span>${series[seriesIndex][dataPointIndex]}</span>
    </div>`,
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
      custom: tooltipFormatter,
      x: {
        show: false,
      },
      y: {
        show: false,
        // formatter: (value, {series, seriesIndex, dataPointIndex, w}) => `Chapter: ${ w.globals.labels[seriesIndex]}, Verse: ${ w.globals.labels[dataPointIndex]}, Score: ${value}`,
      }
    },
  } as ApexOptions
} : ChartProps) {

  //required context
  const namedPairsInfo = useContext(NamedPairsInfoContext);
  chartNamedPairs.namedPairsInfo = namedPairsInfo;

  //state
  const [chartState, setChartState] = useState({
    leftSliderPosition: leftSliderInitialPosition,
    rightSliderPosition: rightSliderInitialPosition,
    sliderMode: initialSliderMode,
  } as ChartState);

  // re-calculates left and right slider position if namedPairsInfo.id changed (otherwise leaves them alone)
  if (chartNamedPairs.namedPairsInfo.id !== chartState.namedPairsInfoId)
    setChartState({...chartState,
      leftSliderPosition: chartNamedPairs.namedPairsInfo.mean - chartNamedPairs.namedPairsInfo.standardDeviation * initialSliderPositionsStdDeviationMultiple / 2,
      rightSliderPosition: chartState.sliderMode === SliderMode.OutsideRange ?
        chartNamedPairs.namedPairsInfo.max :
        chartNamedPairs.namedPairsInfo.mean + chartNamedPairs.namedPairsInfo.standardDeviation * initialSliderPositionsStdDeviationMultiple / 2,
      namedPairsInfoId: chartNamedPairs.namedPairsInfo.id
    });

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
          color: leftColor,
          name: 'low',
        },
        {
          from: leftSliderPosition,
          to: rightSliderPosition - .0000001,
          color: middleColor,
          name: 'average',
        },
        {
          from: rightSliderPosition,
          to: max,
          color: rightColor,
          name: 'high',
        },
      ];
    return {...chartOptions};
  }

  function rangeFilter(
    min: number,
    leftPosition: number,
    rightPosition: number,
    namedPairsCollection: NamedPairs[]) {
      if (chartState.sliderMode === SliderMode.OutsideRange)
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
            x: pair.x,
            y: pair.y,
            originalDatum: pair.originalDatum
          } as Pair))
        }));
  }

  useEffect(() => {
    // mark the focused cell
    const highlightPosition = chartNamedPairs.getChartPositionFromPair(chartNamedPairs.namedPairsInfo.highlightedPair);
    if (highlightPosition) {
      const item = document.querySelector(`.apexcharts-heatmap-rect[i='${highlightPosition.i}'][j='${highlightPosition.j}']`);
      if (item) {
        (item as HTMLElement).style.fill = "green";
        console.debug(`found element class '.apexcharts-heatmap-rect' with i=${highlightPosition.i} and j=${highlightPosition.j}`);
      } else {
        console.error(`couldn't find element class '.apexcharts-heatmap-rect' with i=${highlightPosition.i} and j=${highlightPosition.j}`);
      }
    }
    // add event handlers to each cell so parent can be informed when a Pair (cell) is clicked.
    document.querySelectorAll(`.apexcharts-heatmap-rect`).forEach(element => element.addEventListener('click', (event) => {
      const i = parseInt((event.target as HTMLElement).getAttribute('i') ?? '-1');
      const j = parseInt((event.target as HTMLElement).getAttribute('j') ?? '-1');
      if (i > -1 && j > -1) {
        const namedPair = chartNamedPairs.getPairFromChartPosition({i:i, j:j});
        if (namedPair)
          chartNamedPairs.namedPairsInfo.onPairSelected(namedPair);
      }
    }));
  });

  return (
    <>
      <div>
        <span>Min: {Math.round(chartNamedPairs.namedPairsInfo.min * 1000) / 1000}</span>
        &nbsp;
        <span>Max: {Math.round(chartNamedPairs.namedPairsInfo.max * 1000) / 1000}</span>
        &nbsp;
        <span>Mean: {Math.round(chartNamedPairs.namedPairsInfo.mean * 1000) / 1000}</span>
        &nbsp;
        <span>Standard Deviation: {Math.round(chartNamedPairs.namedPairsInfo.standardDeviation * 1000) / 1000}</span>
        &nbsp;
      </div>
      <div>
        <span>
          <button onClick={() =>
            setChartState({
              ...chartState,
              sliderMode: chartState.sliderMode === SliderMode.OutsideRange ?
                SliderMode.Ranges :
                SliderMode.OutsideRange
              })
          }>
              {chartState.sliderMode === SliderMode.OutsideRange ? 'Outside Range' : 'Range'}
          </button>&nbsp;
          <span>Left Slider Position: {chartState.leftSliderPosition}</span>&nbsp;
          <span>Right Slider Position: {chartState.rightSliderPosition}</span>
        </span>
      </div>
      <div>Displaying: </div>
      <div>
        <DualSlider
          min={chartNamedPairs.namedPairsInfo.min}
          max={chartNamedPairs.namedPairsInfo.max}
          leftColor={leftColor}
          middleColor={chartState.sliderMode === SliderMode.OutsideRange ? 'white' : middleColor}
          rightColor={rightColor}
          leftSliderPosition={chartState.leftSliderPosition}
          rightSliderPosition={chartState.rightSliderPosition}
          minimumGap={minimumSliderGap}
          step={sliderStep}
          onRangeChanged={
            (leftPosition: number, rightPosition: number): void => {
              setChartState({...chartState, leftSliderPosition: leftPosition, rightSliderPosition: rightPosition});
            }
          }
        />
      </div>
      <div>
        <Chart options={
          getChartOptions(
            baseChartOptions,
            chartNamedPairs.namedPairsInfo.min,
            chartNamedPairs.namedPairsInfo.max,
            chartState.leftSliderPosition,
            chartState.rightSliderPosition)}
          series={chartState.sliderMode === SliderMode.OutsideRange ?
              chartNamedPairs.getNamedPairsOutsideRange(
                chartState.leftSliderPosition,
                chartState.rightSliderPosition) :
              chartNamedPairs.namedPairsInfo.namedPairs}
          type="heatmap"
          height={800} />
      </div>
    </>
  );
}

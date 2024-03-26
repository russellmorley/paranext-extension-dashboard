import { useContext, useEffect, useState } from "react";
import {XValuesForY, XYValuesInfoInfoContext, XValue} from './xyvaluesinfo.context';
import { ApexOptions } from "apexcharts";
import Chart from 'react-apexcharts';
import { DualSlider } from "./dualslider.component";
import { ChartXYValues } from "./chart.xyvalues";

export enum SliderMode {
  Ranges = 1,
  OutsideRange
};

type ChartState = {
  leftSliderPosition: number,
  rightSliderPosition: number,
  sliderMode: SliderMode,
  namedValuesInfoId: string
};

export type ChartProps = {
  chartXYValues: ChartXYValues,
  highlightedValue?: XValue,
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

export function ChartsFromXYValuesComponent({
  chartXYValues,
  initialSliderPositionsStdDeviationMultiple = 3,
  initialSliderMode = SliderMode.Ranges,
  leftColor = "#FF0000",
  middleColor = "#AC9F3C",
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
  const xyValuesInfo = useContext(XYValuesInfoInfoContext);
  chartXYValues.xyValuesInfo = xyValuesInfo;

  //state
  const [chartState, setChartState] = useState({
    leftSliderPosition: leftSliderInitialPosition,
    rightSliderPosition: rightSliderInitialPosition,
    sliderMode: initialSliderMode,
  } as ChartState);

  // re-calculates left and right slider position if namedValuesInfo.id changed (otherwise leaves them alone)
  if (chartXYValues.xyValuesInfo.id !== chartState.namedValuesInfoId)
    setChartState({...chartState,
      leftSliderPosition: chartXYValues.xyValuesInfo.mean - chartXYValues.xyValuesInfo.standardDeviation * initialSliderPositionsStdDeviationMultiple / 2,
      rightSliderPosition: chartState.sliderMode === SliderMode.OutsideRange ?
        chartXYValues.xyValuesInfo.max :
        chartXYValues.xyValuesInfo.mean + chartXYValues.xyValuesInfo.standardDeviation * initialSliderPositionsStdDeviationMultiple / 2,
      namedValuesInfoId: chartXYValues.xyValuesInfo.id
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
    namedValuesCollection: XValuesForY[]) {
      if (chartState.sliderMode === SliderMode.OutsideRange)
        return namedValuesCollection.map(namedValues => ({
          name: namedValues.yString,
          data: namedValues.values.map(value => ({
            x: value.x.toString(),
            y: value.value >= rightPosition || value.value <= leftPosition ? value.value : min - 1
          }))
        }));
      else
        return namedValuesCollection.map(namedValues => ({
          name: namedValues.yString,
          data: namedValues.values.map(value => ({
            x: value.x,
            value: value.value,
            originalDatum: value.originalDatum
          } as XValue))
        }));
  }

  useEffect(() => {
    // mark the focused cell
    const ij = chartXYValues.getIJFromXY(chartXYValues.xyValuesInfo.highlightedXY);
    if (ij) {
      const item = document.querySelector(`.apexcharts-heatmap-rect[i='${ij.i}'][j='${ij.j}']`);
      if (item) {
        (item as HTMLElement).style.fill = "green";
        console.debug(`found element class '.apexcharts-heatmap-rect' with i=${ij.i} and j=${ij.j}`);
      } else {
        console.error(`couldn't find element class '.apexcharts-heatmap-rect' with i=${ij.i} and j=${ij.j}`);
      }
    }
    // add event handlers to each cell so parent can be informed when a cell is clicked.
    document.querySelectorAll(`.apexcharts-heatmap-rect`).forEach(element => element.addEventListener('click', (event) => {
      const i = parseInt((event.target as HTMLElement).getAttribute('i') ?? '-1');
      const j = parseInt((event.target as HTMLElement).getAttribute('j') ?? '-1');
      if (i > -1 && j > -1) {
        const xyOriginalDatum = chartXYValues.getXYOriginalDatumFromIJ({i:i, j:j});
        if (xyOriginalDatum)
          chartXYValues.xyValuesInfo.onXYSelected(xyOriginalDatum);
      }
    }));
  });

  if (chartXYValues.xyValuesInfo.xValuesForYs.length < 1)
    return null;
  else
    return (
      <>
        {/* <div>
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
          </span>
        </div> */}
        <div>
          <DualSlider
            min={chartXYValues.xyValuesInfo.min}
            max={chartXYValues.xyValuesInfo.max}
            leftColor={leftColor}
            middleColor={chartState.sliderMode === SliderMode.OutsideRange ? 'white' : middleColor}
            rightColor={rightColor}
            leftSliderPosition={chartState.leftSliderPosition}
            rightSliderPosition={chartState.rightSliderPosition}
            minimumGap={minimumSliderGap}
            step={sliderStep}
            mean={chartXYValues.xyValuesInfo.mean}
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
              chartXYValues.xyValuesInfo.min,
              chartXYValues.xyValuesInfo.max,
              chartState.leftSliderPosition,
              chartState.rightSliderPosition)}
            series={ChartXYValues.toSeries(chartState.sliderMode === SliderMode.OutsideRange ?
                chartXYValues.getXValuesForYOutsideRange(
                  chartState.leftSliderPosition,
                  chartState.rightSliderPosition) :
                chartXYValues.xyValuesInfo.xValuesForYs)}
            type="heatmap"
            height={800} />
        </div>
      </>
    );
}

/* eslint-disable max-classes-per-file */
import { XValuesForY, XYValuesInfo, XY, XYOriginalDatum } from './xyvaluesinfo.context';

export abstract class ChartXYValues {
  abstract get xyValuesInfo(): XYValuesInfo;
  abstract set xyValuesInfo(xyValuesInfo: XYValuesInfo);

  // Changed from unknown return type "ApexAxisChartSeries" for now
  static toSeries(xValuesForYs: XValuesForY[]): unknown {
    return xValuesForYs.map((xValuesForY) => ({
      name: xValuesForY.yString,
      data: xValuesForY.values.map((xValue) => ({
        x: xValue.x,
        y: xValue.value,
        originalDatum: xValue.originalDatum,
      })),
    })); // as ApexAxisChartSeries;
  }

  /**
   * Convert from Chart graphical coordinates to series coordinates
   * @param ij
   * @returns XYOriginalDatum
   */
  abstract getXYOriginalDatumFromIJ(ij: { i: number; j: number }): XYOriginalDatum | undefined;
  abstract getIJFromXY(xy: XY | undefined): { i: number; j: number } | undefined;
  abstract getXValuesForYOutsideRange(low: number, high: number): XValuesForY[];
}

export class HeatmapAscendingXYValues extends ChartXYValues {
  protected xyValuesInfoInternal?: XYValuesInfo;

  get xyValuesInfo(): XYValuesInfo {
    if (!this.xyValuesInfoInternal) throw new Error('xyValuesInfo not set');
    return this.xyValuesInfoInternal;
  }

  set xyValuesInfo(xyValuesInfo: XYValuesInfo) {
    xyValuesInfo.xValuesForYs = xyValuesInfo.xValuesForYs
      .map((xValuesForY) => {
        xValuesForY.values.sort((a, b) => {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
          return 0;
        });
        return xValuesForY;
      })
      .sort((a, b) => {
        if (a.y < b.y) return 1;
        if (a.y > b.y) return -1;
        return 0;
      });
    this.xyValuesInfoInternal = xyValuesInfo;
  }

  getXValuesForYOutsideRange(low: number, high: number): XValuesForY[] {
    return this.xyValuesInfo.xValuesForYs.map<XValuesForY>((xValuesForY) => ({
      yString: xValuesForY.yString,
      // This this right?
      y: NaN,
      values: xValuesForY.values.map((xValue) => ({
        x: xValue.x,
        value:
          xValue.value >= high || xValue.value <= low ? xValue.value : this.xyValuesInfo.min - 1,
        originalDatum: xValue.originalDatum,
      })),
    }));
  }

  getXYOriginalDatumFromIJ(ij: { i: number; j: number }): XYOriginalDatum | undefined {
    const xValuesForY = this.xyValuesInfoInternal?.xValuesForYs[ij.i];
    if (!xValuesForY) return undefined;

    const xValue = xValuesForY?.values[ij.j];
    if (!xValue) return undefined;

    return { y: xValuesForY?.y, x: xValue?.x, originalDatum: xValue?.originalDatum };
  }

  getIJFromXY(xy: { x: number; y: number } | undefined): { i: number; j: number } | undefined {
    if (!xy) return undefined;
    const i = this.xyValuesInfoInternal?.xValuesForYs
      .map((xValuesForY) => xValuesForY.y)
      .indexOf(xy.y);
    if (i === undefined) return undefined;
    const j = this.xyValuesInfoInternal?.xValuesForYs[i].values
      .map((xValue) => xValue.x)
      .indexOf(xy.x);
    if (j === undefined) return undefined;
    return { i, j };
  }
}

import { XValuesForY, XYValuesInfo, XValue, XY, XYOriginalDatum } from "./xyvaluesinfo.context";

export abstract class  ChartXYValues {
  abstract get xyValuesInfo(): XYValuesInfo;
  abstract set xyValuesInfo(xyValuesInfo: XYValuesInfo);

  /**
   * Convert from Chart graphical coordinates to series coordinates
   * @param ij
   * @returns XYOriginalDatum
   */
  abstract getXYOriginalDatumFromIJ(ij: {i: number, j: number}): XYOriginalDatum | undefined;
  abstract getIJFromXY(xy: XY | undefined): {i: number, j: number} | undefined;
  abstract getXValuesForYOutsideRange(low: number, high: number): XValuesForY[];
  static toSeries(xValuesForYs: XValuesForY[]): ApexAxisChartSeries {
    return xValuesForYs.map(xValuesForY => ({
      name: xValuesForY.yString,
      data: xValuesForY.values.map(xValue => ({
        x: xValue.x,
        y: xValue.value,
        originalDatum: xValue.originalDatum
      }))
    })) as ApexAxisChartSeries;
  }
}

export class HeatmapAscendingXYValues extends ChartXYValues{
  protected _xyValuesInfo?: XYValuesInfo;

  set xyValuesInfo(xyValuesInfo: XYValuesInfo) {
    xyValuesInfo.xValuesForYs = xyValuesInfo.xValuesForYs
      .map(xValuesForY => {
        xValuesForY.values.sort((a,b) => {
          if (a.x < b.x)
            return -1;
          else if (a.x > b.x)
            return 1;
          else
            return 0;
        });
        return xValuesForY;
      })
      .sort((a, b) => {
        if (a.y < b.y)
          return 1;
        else if (a.y > b.y)
          return -1;
        else
          return 0;
      });
      this._xyValuesInfo = xyValuesInfo;
  }

  get xyValuesInfo():XYValuesInfo {
    if (!this._xyValuesInfo)
      throw new Error('xyValuesInfo not set');
    return this._xyValuesInfo;
  }

  getXValuesForYOutsideRange(low: number, high: number): XValuesForY[]{
    return this.xyValuesInfo.xValuesForYs.map(xValuesForY => ({
        yString: xValuesForY.yString,
        values: xValuesForY.values.map(xValue => ({
          x: xValue.x,
          value: xValue.value >= high || xValue.value <= low ? xValue.value : this.xyValuesInfo!.min - 1,
          originalDatum: xValue.originalDatum
        } as XValue))
      } as XValuesForY));
  }

  getXYOriginalDatumFromIJ(ij: {i: number, j: number}): XYOriginalDatum | undefined {
    const xValuesForY = this._xyValuesInfo?.xValuesForYs[ij.i];
    if (!xValuesForY)
      return;

    const xValue = xValuesForY?.values[ij.j];
    if (!xValue)
      return;

    return {y: xValuesForY?.y, x: xValue?.x, originalDatum: xValue?.originalDatum};
  }

  getIJFromXY(xy: {x: number, y: number} | undefined): {i: number, j: number} | undefined {
    if (!xy)
      return undefined;
    const i = this._xyValuesInfo?.xValuesForYs.map(xValuesForY => xValuesForY.y).indexOf(xy.y);
    if (i === undefined)
      return undefined;
    const j = this._xyValuesInfo?.xValuesForYs[i].values.map(xValue => xValue.x).indexOf(xy.x);
    if (j === undefined)
      return undefined;
    return {i: i, j: j};
  }
}

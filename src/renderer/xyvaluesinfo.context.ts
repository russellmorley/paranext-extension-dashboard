import { createContext } from 'react';

export type XY = {x: number, y: number};
export type XYOriginalDatum = XY & {originalDatum?: any};
export type XValue = {x: number, value: number, originalDatum?: any};
export type XValuesForY = {yString: string, y: number, values: XValue[]};
export type OnXYSelected = (xyOriginalDatum: XYOriginalDatum) => void;
export type XYValuesInfo = {
  id: string,
  xValuesForYs: XValuesForY[],
  min: number,
  max: number,
  mean: number,
  standardDeviation: number,
  highlightedXY: XY | undefined,
  onXYSelected: OnXYSelected
};

export const XYValuesInfoInfoContext = createContext({} as XYValuesInfo);

import { createContext } from 'react';

export type XY = { x: number; y: number };
// TODO: Pick a better type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type XYOriginalDatum = XY & { originalDatum?: any };
// TODO: Pick a better type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type XValue = { x: number; value: number; originalDatum?: any };
export type XValuesForY = { yString: string; y: number; values: XValue[] };
export type OnXYSelected = (xyOriginalDatum: XYOriginalDatum) => void;
export type XYValuesInfo = {
  id: string;
  xValuesForYs: XValuesForY[];
  min: number;
  max: number;
  mean: number;
  standardDeviation: number;
  highlightedXY: XY | undefined;
  onXYSelected: OnXYSelected;
};

export const XYValuesInfoInfoContext = createContext<XYValuesInfo>({
  id: '',
  xValuesForYs: [],
  min: NaN,
  max: NaN,
  mean: NaN,
  standardDeviation: NaN,
  highlightedXY: undefined,
  onXYSelected: () => {},
});

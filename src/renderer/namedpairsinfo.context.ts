import { createContext } from 'react';

export type Pair = {x: number, y: number, originalDatum?: {}};
export type NamedPairs = {name: string, number: number, data: Pair[]};
export type OnPairSelected = (pair: Pair) => void;
export type NamedPairsInfo = {
  id: string,
  namedPairs: NamedPairs[],
  min: number,
  max: number,
  mean: number,
  standardDeviation: number,
  highlightedPair: Pair | undefined,
  onPairSelected: OnPairSelected
};

export const NamedPairsInfoContext = createContext({} as NamedPairsInfo);

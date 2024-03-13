import { createContext } from 'react';

export type Pair = {x: number, y: number};
export type NamedPairs = {name: string, data: Pair[]};
export type NamedPairsInfo = {
  namedPairs: NamedPairs[],
  min: number,
  max: number,
  mean: number,
  standardDeviation: number,
  pairWithFocus: Pair | undefined,
  onPairSelected: (pair:Pair  | undefined) => void
};

export const NamedPairsInfoContext = createContext({} as NamedPairsInfo);

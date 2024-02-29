import { createContext } from 'react';

export type NamedPairs = {name: string, data: [{x: string, y: number}]};

export const NamedPairsContext = createContext([] as NamedPairs[]);

import { createContext } from 'react';

export type NamedPairs = {name: string, data: [{x: string, y: number}]};

export const NamedPairsCollectionContext = createContext([] as NamedPairs[]);

import { createContext } from 'react';
import { NamedPairs } from './aqua.namedpairs.datacontext';

export const NamedPairsCollectionContext = createContext([] as NamedPairs[]);

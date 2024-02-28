import { createContext } from 'react';
import { Verse } from './dashboard.verses.datacontext';


export const VersesContext = createContext([] as Verse[]);

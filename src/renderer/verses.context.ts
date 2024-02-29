import { createContext } from 'react';

export type Token = {id: number, text: string};
export type Verse = {id: number, verseRef: string, tokens: Token[]};

export const VersesContext = createContext([] as Verse[]);

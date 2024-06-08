import { createContext } from 'react';
import { IPersist } from 'src/types/persist.type';
import { Requester } from 'src/types/requester.type';
import { AsyncTask } from './utils/async-task.util';

export type Environment = {
  requester: Requester | undefined;
  persist: IPersist | undefined;
  asyncTask: AsyncTask | undefined;
};

export const EnvironmentContext = createContext<Environment>({
  requester: undefined,
  persist: undefined,
  asyncTask: undefined,
});

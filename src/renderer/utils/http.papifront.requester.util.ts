import papi from '@papi/frontend';
import { Requester } from 'src/types/requester.type';

function debounce<A, B, R>(
  fn: (args1: A, args2: B) => Promise<R>,
  ms: number,
): (args1: A, args2: B) => Promise<R> {
  let timer: number;
  const debouncedFunc = (args1: A, args2: B): Promise<R> =>
    new Promise<R>((resolve) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        resolve(fn(args1, args2));
      }, ms);
    });

  return debouncedFunc;
}

// Helps prevent accidental spamming of online services, only refetch at most every 5 seconds
// This can be removed once there are better protections in place
const debouncedFetch = debounce(papi.fetch, 5000);

export const httpPapiFrontRequester: Requester = async <T>(
  request: string,
  configuration?: RequestInit,
): Promise<T> => {
  console.log(configuration);
  const response = await debouncedFetch(request, configuration);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

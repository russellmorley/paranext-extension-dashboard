import { Requester } from 'src/types/requester.type';

export const httpBrowserRequester: Requester = async <T>(
  request: string,
  configuration?: RequestInit,
): Promise<T> => {
  console.log(configuration);
  const response = await fetch(request, configuration);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

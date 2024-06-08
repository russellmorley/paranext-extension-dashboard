import papi from '@papi/backend';
import { Requester } from 'src/types/requester.type';

export const httpPapiBackRequester: Requester = async (
  request: string,
  configuration?: RequestInit,
) => {
  console.log(configuration);
  const response = await papi.fetch(request, configuration);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

import papi from "@papi/frontend";
import { Requester } from "src/types/requester.type";

export const httpPapiFrontRequester: Requester = async <T>(request: string, configuration?: RequestInit) => {
  console.log(configuration);
  const response = await papi.fetch(request, configuration);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return (await response.json()) as Promise<T>;
};

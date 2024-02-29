
export type Requester = <T>(request: string, configuration?: RequestInit) => Promise<T>;

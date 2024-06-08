// TODO: Pick a better type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Func = (params: Array<any>) => any;

export class AsyncTask {
  worker: Worker | undefined;
  func: Func | undefined;

  // TODO: Pick a better type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run = (func: Func, params: Array<any>): Promise<any> => {
    // TODO: Pick a better type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Promise<any>((resolve, reject) => {
      if (this.worker) reject(new Error('Task currently in use'));

      this.func = func;
      // configure an inline worker script that runs this.func when a postMessage is made to it.
      const funcString = `onmessage = (e) => { postMessage(${this.func}(e.data); }"])`;
      const blob = new Blob([funcString]);
      const blobURL = window.URL.createObjectURL(blob);

      this.worker = new Worker(blobURL); // supply the inline function to the worker
      this.worker.onmessage = (e) => {
        resolve(e.data); // resolve when the function is done and its results posted back.
      };
      this.worker.postMessage(params);
      // new call the worker so it processes the supplied function, supplying the parameters.
    });
  };

  stop = () => {
    this.worker?.terminate();
    this.worker = undefined;
    this.func = undefined;
  };
}

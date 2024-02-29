
export type Func = (params: Array<any>) => any;

export class AsyncTask {

  worker: Worker | undefined;
  func: Func | undefined;

  constructor() {
  }

  run = (func: Func, params: Array<any>): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      if (this.worker)
        reject("Task currently in use");

      this.func = func;
      // configure an inline worker script that runs this.func when a postMessage is made to it.
      const funcString = `onmessage = (e) => { postMessage(${this.func}(e.data); }"])`;
      const blob = new Blob([funcString]);
      const blobURL = window.URL.createObjectURL(blob);

      this.worker = new Worker(blobURL); // supply the inline function to the worker
      this.worker.onmessage = function(e) {
        resolve(e.data); //resolve when the function is done and its results posted back.
      };
      this.worker.postMessage(params);
      // new call the worker so it processes the supplied function, supplying the parameters.
    })
  }

  stop = () => {
    this.worker?.terminate();
    this.worker = undefined;
    this.func = undefined;
  }
}

/*
  //Usage:

  const lock = new AsyncLock()  //by default unlocked.

  lock.lock();

  async function test () {
    // wait for lock to be unlocked
    await lock.promise

    // do something after lock is released.
    console.log('Next thing to do');
  }

  // now unlock after some long work that takes 10 seconds
  setTimeout(() => lock.unlock(), 10000);

  */
export class AsyncLock {
  unlock: () => void;
  promise: Promise<void>;

  constructor () {
    this.unlock = () => undefined;
    this.promise = Promise.resolve(); // will immediately resolve when not locked
  }

  lock () {
    // assign a function to this.unlock that resolves the promise then resets it
    // to one that resolves immediately since it should again be unlocked.
    this.promise = new Promise(resolve => this.unlock = () => {
      resolve();
      this.promise = Promise.resolve();
    });
  }
}

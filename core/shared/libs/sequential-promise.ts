/**
 * Execute a list of `Promise` factories in sequence.
 */
export function sequentialPromise(tasks: (() => Promise<any>)[]) {
  return new Promise<void>((resolve, reject) => {
    tasks
      .reduce(async (curr, next) => {
        return curr.then(next);
      }, Promise.resolve())
      .then(() => resolve())
      .catch(reject);
  });
}

/**
 * Creates a pipe function designed to work with synchronous or asynchronous
 * code.
 */
export function promisePipe<T extends any>(...tasks: (((arg: T) => Promise<T>) | ((arg: T) => T))[]) {
  return (initial: T) => {
    return new Promise<T>((resolve, reject) => {
      tasks
        .reduce(async (curr, next) => {
          return curr.then(next);
        }, Promise.resolve(initial))
        .then(resolve)
        .catch(reject);
    });
  };
}

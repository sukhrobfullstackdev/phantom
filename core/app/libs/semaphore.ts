import Semaphore from 'semaphore-async-await';

export const MAXIMUM_CONCURRENCY = 5;

export const uiThreadLock = new Semaphore(1);
export const atomicJsonRpcMethodLock = new Semaphore(1);
export const jsonRpcConcurrencyLock = new Semaphore(MAXIMUM_CONCURRENCY);

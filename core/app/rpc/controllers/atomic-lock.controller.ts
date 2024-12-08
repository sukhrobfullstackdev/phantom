import { JsonRpcRequestPayload } from 'magic-sdk';
import { getPayloadData, getPayloadEventEmitter } from '../utils';
import { atomicJsonRpcMethodLock } from '~/app/libs/semaphore';
import { RpcMiddleware } from '../types';

type AtomicLockMiddleware = (isAtomic?: (payload: JsonRpcRequestPayload) => boolean) => RpcMiddleware;

export const atomic: AtomicLockMiddleware =
  (isAtomic = () => true) =>
  async (ctx, next) => {
    const { payload } = ctx;
    const payloadData = getPayloadData(payload);
    const shouldLock = isAtomic(payload);

    if (!shouldLock) {
      next();
      return;
    }

    if (!payloadData.didAcquireAtomicSemaphorePermit) {
      await atomicJsonRpcMethodLock.acquire();

      getPayloadEventEmitter(payload).once('done', () => {
        atomicJsonRpcMethodLock.signal();
      });

      payloadData.didAcquireAtomicSemaphorePermit = true;
    }
    next();
  };

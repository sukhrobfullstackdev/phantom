import { JsonRpcError, JsonRpcRequestPayload } from 'magic-sdk';
import { ThunkActionWrapper } from '../types';
import { SDKError, sdkErrorFactories } from '../../libs/exceptions';
import { uiThreadLock } from '../../libs/semaphore';

// Actions & Thunks
import { setShowUI } from '../system/system.actions';
import { SystemThunks } from '../system/system.thunks';
import { setUIThreadError, setUIThreadPayload, setUIThreadRenderFn, setUIThreadResponse } from './ui-thread.actions';

/**
 * Initiate the UI thread to process a JSON RPC payload, resolves `true` if the
 * thread was successfully opened. If the thread fails to open for some reason,
 * the payload will be rejected.
 *
 * @param payload - The JSON RPC payload being handled in the UI Thread.
 */
function acquireLockAndShowUI(
  payload: JsonRpcRequestPayload,
  render?: React.FC<any>,
): ThunkActionWrapper<Promise<boolean>> {
  return async (dispatch, getState) => {
    const currentPayload = getState().UIThread.payload;
    if (payload.method === currentPayload?.method) {
      await sdkErrorFactories.client.duplicatePayload(payload.method).sdkReject(payload);
      return false;
    }

    await uiThreadLock.acquire();
    dispatch(setShowUI(true));
    dispatch(setUIThreadPayload(payload));
    dispatch(setUIThreadError(undefined));
    dispatch(setUIThreadRenderFn(render));
    return true;
  };
}

/**
 * Close and resolve/reject the current JSON RPC payload being processed in the
 * UI thread.
 */
function releaseLockAndHideUI<T>(
  configuration: {
    error?: JsonRpcError | SDKError;
    result?: T;
  },
  toBeResolved = true,
): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    const { payload } = getState().UIThread;

    // There can only be ONE UI thread permit at a time, so "closing" the thread
    // is a no op if a permit exists.
    if (uiThreadLock.getPermits() === 0 && !!payload) {
      dispatch(setUIThreadPayload(undefined));
      if (toBeResolved) {
        // Only partial whitelabel will skip resolving payload while closing the UI
        await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, ...configuration }));
      }
      dispatch(setShowUI(false));
      dispatch(setUIThreadRenderFn(undefined));
      dispatch(setUIThreadResponse(undefined));
      uiThreadLock.release();
    }
  };
}

/**
 * Export module to stub local function stub for testing purpose
 */
export const UIThreadThunks = {
  releaseLockAndHideUI,
  acquireLockAndShowUI,
};

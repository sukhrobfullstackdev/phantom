import { JsonRpcRequestPayload } from 'magic-sdk';
import { isServiceError, isControlFlowError, isSDKError, isIconError, resolveErrorMessage } from './error-utils';
import { sdkErrorFactories } from '.';
import { store } from '~/app/store';
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';
import { createControlFlowError } from './error-types/control-flow-error';
import { ControlFlowErrorCode } from './error-types/error-codes/control-flow-error-codes';

/**
 * Automatically funnels errors through to the UI thread or SDK, depending on
 * context.
 */
async function handleUIError(err: any) {
  if (isServiceError(err)) return err.getControlFlowError().setUIThreadError();

  if (isControlFlowError(err)) return err.setUIThreadError();

  if (isSDKError(err)) return store.dispatch(UIThreadThunks.releaseLockAndHideUI({ error: err }));

  if (isIconError(err)) {
    const iconErr = sdkErrorFactories.icon.iconError(err.message);
    return store.dispatch(UIThreadThunks.releaseLockAndHideUI({ error: iconErr }));
  }

  return createControlFlowError(ControlFlowErrorCode.GenericServerError, err).setUIThreadError();
}

/**
 * Automatically funnels errors through to the SDK.
 */
async function handleGenericError(payload: JsonRpcRequestPayload, err: any) {
  if (isServiceError(err)) {
    return err.getControlFlowError().getSDKError().sdkReject(payload);
  }

  if (isControlFlowError(err)) return err.getSDKError().sdkReject(payload);

  if (isSDKError(err)) return err.sdkReject(payload);

  if (isIconError(err)) {
    return sdkErrorFactories.icon.iconError(err.message).sdkReject(payload);
  }

  return sdkErrorFactories.rpc.internalError(resolveErrorMessage(err)).sdkReject(payload);
}

/**
 * Generically handle error rejections in context of the current flow. We
 * automatically catch every JSON RPC payload handler with this error handler.
 */
export async function handleError(payload: JsonRpcRequestPayload, err: any) {
  const state = store.getState();

  if (state.System.showUI && payload.id === state.UIThread.payload?.id) {
    await handleUIError(err);
  } else {
    await handleGenericError(payload, err);
  }
}

/**
 * Gets an error message from any unkown caught error
 * Generally used for logging to Datadog
 */
export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

import { JsonRpcError, JsonRpcRequestPayload, JsonRpcResponsePayload, MagicIncomingWindowMessage } from 'magic-sdk';
import { isUndefined } from '~/app/libs/lodash-utils';
import { isSDKError, SDKError } from '../../libs/exceptions';
import { ThunkActionWrapper } from '../types';
import { MessageChannelService } from '../../services/message-channel';
import { getPayloadEventEmitter } from '../../rpc/utils';
import { getAuthUserRT, getDeviceShare } from '../auth/auth.selectors';
import { trackBlockchainSignedEvent } from '~/app/libs/web3-utils';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';
import { resetActivePayload } from '../active-payload/active-payload.actions';
import { store } from '..';

/**
 * Dispatches a payload response event to the SDK. Payloads can only be
 * handled once. This is either a succesfully resolved response, or an error
 */
function resolveJsonRpcResponse<T>(configuration: {
  payload: JsonRpcRequestPayload;
  error?: JsonRpcError | SDKError;
  result?: T;
}): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    const error = isSDKError(configuration.error) ? configuration.error.jsonRpcError : configuration.error ?? undefined;

    const hasError = !isUndefined(error);
    const hasResult = !isUndefined(configuration.result) && !hasError;

    const response: JsonRpcResponsePayload = {
      jsonrpc: configuration.payload.jsonrpc ?? '2.0',
      id: configuration.payload.id ?? null,
      result: hasResult ? configuration.result : undefined,
      error: hasError ? error : undefined,
    };

    trackBlockchainSignedEvent(configuration.payload, getState, hasResult);

    const rt = getAuthUserRT(getState());

    const deviceShare = getDeviceShare(getState());

    MessageChannelService.rpc.post(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, response, rt, deviceShare);

    // wipe the active payload in redux, used for logging
    store.dispatch(resetActivePayload());

    // Clear intermediary event listeners
    RpcIntermediaryEventService.remove(configuration.payload);

    getPayloadEventEmitter(configuration.payload).emit('done');
  };
}

/**
 * Dispatches a payload event to the SDK. This is separate from the reponse
 * event handled by `resolveJsonRpcResponse`, which effectively closes the
 * payload connection. This action can be dispatched as many times as needed for
 * the specified payload.
 */
function emitJsonRpcEvent(configuration: {
  payload: JsonRpcRequestPayload;
  event: string;
  params?: any[];
}): ThunkActionWrapper<Promise<void>> {
  return async () => {
    const { payload, event, params = [] } = configuration;

    const response: JsonRpcResponsePayload = {
      jsonrpc: payload.jsonrpc ?? '2.0',
      id: payload.id ?? null,
      result: { event, params },
    };

    MessageChannelService.rpc.post(MagicIncomingWindowMessage.MAGIC_HANDLE_EVENT, response);
  };
}

/**
 * Export module to stub local function stub for testing purpose
 */
export const SystemThunks = {
  emitJsonRpcEvent,
  resolveJsonRpcResponse,
};

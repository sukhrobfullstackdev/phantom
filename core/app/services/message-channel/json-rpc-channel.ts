import {
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  MagicIncomingWindowMessage,
  MagicOutgoingWindowMessage,
} from 'magic-sdk';
import { supportsCustomNode } from '~/app/libs/network';
import { getRawOptions } from '~/app/libs/query-params';
import { routeJsonRpcBatch, routeJsonRpcMethod } from '~/app/rpc';
import { getPayloadData } from '~/app/rpc/utils';
import { isAndroidSDK } from '~/app/libs/platform';
import { isArray } from '~/app/libs/lodash-utils';
import { JsonRpcResponseTracker, MessageEventData } from '~/app/services/message-channel/json-rpc-response-tracker';
import { JsonRpcBatchRequestPayload } from 'fortmatic';
import { store } from '~/app/store';
import { setEventOrigin } from '~/app/store/system/system.actions';
import { getFirstReferrer, isFCL } from '~/app/libs/fcl/is-fcl';

interface IncomingMessageEvent extends MessageEvent {
  data: MessageEventData | string;
}

/**
 * Resolves the given `msgType` with the encoded query parameters (these serve
 * as an "origin signature" to prevent duplicate `<iframe>` instances from the
 * SDK).
 */
function resolveMessageType(msgType: MagicIncomingWindowMessage | MagicOutgoingWindowMessage) {
  if (!supportsCustomNode()) return msgType; // Legacy form factor omits "origin signature"
  const encodedQueryParams = getRawOptions();
  return `${msgType}-${encodedQueryParams}`;
}

/**
 * Parse `evt.data` depending on the type of data passed (whether JSON string or
 * plain object).
 */
function parseEventData(data: any): Partial<MessageEventData> {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data ?? {};
  } catch {
    return data ?? {};
  }
}

/**
 * The event listener that will be attached to the `Window.onmessage` event.
 * This is the entry point for handling incoming JSON RPC payloads.
 */
export async function handle(evt: IncomingMessageEvent) {
  const evtData = parseEventData(evt.data);

  // For Android MobileSDKs send back message receipt
  if (isAndroidSDK() && !!evtData?.payload?.id) {
    post(MagicIncomingWindowMessage.MAGIC_MG_BOX_SEND_RECEIPT, {
      jsonrpc: '2.0',
      id: evtData?.payload?.id,
      result: null,
      error: null,
    });
  }

  if (evtData?.payload) {
    const payloadData = getPayloadData(evtData?.payload);
    payloadData.rt = evtData?.rt;
    payloadData.jwt = evtData?.jwt;
    payloadData.deviceShare = evtData?.deviceShare;
  }

  // this determines of the incoming post message event is an RPC request
  if (evtData?.msgType === resolveMessageType(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST)) {
    if (isFCL()) {
      store.dispatch(setEventOrigin(getFirstReferrer() ?? evt.origin));
    } else {
      store.dispatch(setEventOrigin(evtData?.clientAppOrigin ?? evt.origin));
    }

    JsonRpcResponseTracker.addTrackingDataToWindow(evtData);

    if (isArray(evtData?.payload))
      routeJsonRpcBatch(evtData?.payload as JsonRpcBatchRequestPayload | JsonRpcRequestPayload[]);
    else routeJsonRpcMethod(evtData?.payload);
  }
}

/**
 * Wraps `window.postMessage` with the parent context and automatically resolves
 * the origin-namespaced message type.
 */
export function post(
  msgType: MagicIncomingWindowMessage,
  response?: JsonRpcResponsePayload,
  rt?: string,
  deviceShare?: string,
) {
  window.parent.postMessage({ msgType: resolveMessageType(msgType), response, rt, deviceShare }, '*');

  // the response is specifically a JSON RPC Response
  if (msgType === MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE) {
    const jsonRpcError = response?.error;
    JsonRpcResponseTracker.logCompletion(response, msgType, rt, jsonRpcError);
  }
}

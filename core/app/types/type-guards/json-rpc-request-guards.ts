import { JsonRpcBatchRequestPayload } from 'fortmatic';
import { JsonRpcRequestPayload } from 'magic-sdk';

/**
 * Assert `value` is a `JsonRpcBatchRequestPayload` object.
 */
export function isJsonRpcBatchRequestPayload(
  value?: JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
): value is JsonRpcBatchRequestPayload {
  if (!value) return false;
  return (
    !!value.jsonrpc &&
    !!value.id &&
    !!value.method &&
    !!(value as JsonRpcBatchRequestPayload).batch &&
    !(value as JsonRpcRequestPayload).params
  );
}

/**
 * Assert `value` is a `JsonRpcRequestPayload` object.
 */
export function isJsonRpcRequestPayload(
  value?: JsonRpcRequestPayload | JsonRpcBatchRequestPayload,
): value is JsonRpcRequestPayload {
  if (!value) return false;
  return (
    !!value.jsonrpc &&
    !!value.id &&
    !!value.method &&
    !!(value as JsonRpcRequestPayload).params &&
    !(value as JsonRpcBatchRequestPayload).batch
  );
}

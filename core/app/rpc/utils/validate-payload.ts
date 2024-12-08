import { JsonRpcBatchRequestPayload } from 'fortmatic';
import { isEmpty, isNil, isPlainObject, isUndefined } from '~/app/libs/lodash-utils';

import { JsonRpcRequestPayload } from 'magic-sdk';
import { isValidJSON } from '~/shared/libs/validators';
import { sdkErrorFactories } from '../../libs/exceptions';
import { isJsonRpcBatchRequestPayload } from '../../types/type-guards';

/**
 * Validates a payload meets the JSON RPC 2.0 spec, in addition to several other
 * internal checks to make sure we can handle the payload successfully.
 */
export async function validatePayload(payload?: JsonRpcRequestPayload | JsonRpcBatchRequestPayload) {
  // Assert valid JSON
  if (!isValidJSON(payload)) {
    await sdkErrorFactories.rpc.parseError().sdkReject(payload);
    return false;
  }

  // Assert plain object
  if (!isPlainObject(payload)) {
    await sdkErrorFactories.client.malformedPayload().sdkReject(payload);
    return false;
  }

  // Assert valid `payload.id` field
  // We don't support JSON RPC "notifications"
  if (isNil(payload?.id)) {
    await sdkErrorFactories.client.missingPayloadId().sdkReject(payload);
    return false;
  }

  // Assert valid `payload.jsonrpc` field
  if (isUndefined(payload?.jsonrpc)) {
    await sdkErrorFactories.client.missingRpcVersion().sdkReject(payload);
    return false;
  }

  // Assert valid batch (only relevant to Fortmatic JS)
  if (isJsonRpcBatchRequestPayload(payload) && isEmpty(payload?.batch)) {
    await sdkErrorFactories.client.missingPayloadBatch().sdkReject(payload);
    return false;
  }

  // Yay! We can proceed!
  return true;
}

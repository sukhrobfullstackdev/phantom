import { JsonRpcResponsePayload, JsonRpcRequestPayload } from 'magic-sdk';
import { getCustomNodeNetworkUrl, isCustomNode } from '../../libs/network';
import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { createSDKError, resolveErrorCode, resolveErrorMessage } from '~/app/libs/exceptions';

function handleNodeError(res: JsonRpcResponsePayload) {
  if (res?.error) {
    const data = res?.error?.data;
    throw createSDKError(resolveErrorCode(res), 'Error forwarded from node', resolveErrorMessage(res), data);
  }
}

function fortmaticEthereumProxy(payload: JsonRpcRequestPayload) {
  const endpoint = `v1/ethereum/provider/async/proxy`;
  return HttpService.magic.post<JsonRpcRequestPayload, MagicAPIResponse<JsonRpcResponsePayload>>(endpoint, payload);
}

export async function ethereumProxy<T = any>(payload: JsonRpcRequestPayload): Promise<T | null | undefined> {
  if (isCustomNode()) {
    const nodeUrl = getCustomNodeNetworkUrl();

    if (nodeUrl) {
      const res = await HttpService.json.post<JsonRpcRequestPayload, JsonRpcResponsePayload<T>>(nodeUrl, payload);
      handleNodeError(res);

      return res.result;
    }
  }

  const res = (await fortmaticEthereumProxy(payload)).data;
  handleNodeError(res);

  return res.result;
}

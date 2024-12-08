import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { NFTApiResponse } from './types';
import { HttpService } from '../http';

export type FetchRequestStatusParams = {
  requestId: string;
};

export type FetchRequestStatusResponse = {
  status: string;
  requestId: string;
  orderId?: string;
};

export const fetchRequestStatus = async (
  params: FetchRequestStatusParams,
): Promise<NFTApiResponse<FetchRequestStatusResponse>> => {
  const endpoint = 'v1/nft/request/status';
  getLogger().info(`nft-api:, ${endpoint}`, params);

  const { requestId } = params;

  try {
    const response = await HttpService.nft.get<{
      status: string;
      request_id: string;
      payment_provider_order_id: string;
    }>(endpoint, {
      params: {
        request_id: requestId,
        include_order_id: 'true',
      },
    });

    return {
      error: null,
      data: {
        status: response.status,
        requestId: response.request_id,
        orderId: response?.payment_provider_order_id,
      },
    };
  } catch (e) {
    getLogger().error(`nft-api: ${endpoint}`, buildMessageContext(e));
    if (e instanceof Error) {
      return { error: e.message, data: null };
    }
    return { error: 'Unknown error', data: null };
  }
};

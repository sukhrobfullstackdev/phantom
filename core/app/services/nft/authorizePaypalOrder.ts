import { getLogger } from '~/app/libs/datadog';
import { NFTApiResponse } from './types';
import { HttpService } from '../http';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

export type AuthorizePaypalOrderParams = {
  orderId: string;
};

export type AuthorizePaypalOrderResponse = {
  requestId: string;
};

export const authorizePaypalOrder = async (
  params: AuthorizePaypalOrderParams,
): Promise<NFTApiResponse<AuthorizePaypalOrderResponse>> => {
  const endpoint = 'v1/nft/checkout/authorize_order';
  getLogger().info(`nft-api:, ${endpoint}`, params);

  const { orderId } = params;

  try {
    const response = await HttpService.nft.post<{ payment_provider_order_id: string }, { request_id: string }>(
      endpoint,
      {
        payment_provider_order_id: orderId,
      },
    );

    return {
      error: null,
      data: {
        requestId: response.request_id,
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

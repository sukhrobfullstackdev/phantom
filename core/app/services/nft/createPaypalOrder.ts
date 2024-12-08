import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { NFTApiResponse } from './types';
import { HttpService } from '../http';

export type CreatePaypalOrderParams = {
  contractId: string;
  toAddress: string;
  tokenId: string;
  quantity: string;
};

export type CreatePaypalOrderResponse = {
  magicOrderId: string;
  paymentProviderOrderId: string;
};

export const createPaypalOrder = async (
  params: CreatePaypalOrderParams,
): Promise<NFTApiResponse<CreatePaypalOrderResponse>> => {
  const endpoint = 'v1/nft/checkout/create_order';
  getLogger().info(`nft-api:, ${endpoint}`, params);

  const { contractId, toAddress, tokenId, quantity } = params;

  try {
    const response = await HttpService.nft.post<
      { contract_id: string; to_address: string; token_id: string; quantity: string },
      { magic_order_id: string; payment_provider_order_id: string }
    >(endpoint, {
      contract_id: contractId,
      to_address: toAddress,
      token_id: tokenId,
      quantity,
    });

    return {
      error: null,
      data: {
        magicOrderId: response.magic_order_id,
        paymentProviderOrderId: response.payment_provider_order_id,
      },
    } as { error: null; data: CreatePaypalOrderResponse };
  } catch (e) {
    getLogger().error(`nft-api: ${endpoint}`, buildMessageContext(e));
    if (e instanceof Error) {
      return { error: e.message, data: null };
    }
    return { error: 'Unknown error', data: null };
  }
};

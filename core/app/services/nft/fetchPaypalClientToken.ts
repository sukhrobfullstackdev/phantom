import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { NFTApiResponse } from './types';
import { HttpService } from '../http';

export type FetchPaypalClientTokenParams = {
  magicClientId: string;
  contractId: string;
};

export type FetchPaypalClientTokenResponse = {
  paypalBnCode: string;
  paypalClientId: string;
  paypalClientToken: string;
  paypalMerchantId: string;
};

export const fetchPaypalClientToken = async (
  params: FetchPaypalClientTokenParams,
): Promise<NFTApiResponse<FetchPaypalClientTokenResponse>> => {
  const endpoint = 'v1/nft/checkout/client_token';
  getLogger().info(`nft-api:, ${endpoint}`, params);

  const { magicClientId, contractId } = params;

  try {
    const response = await HttpService.nft.get<{
      paypal_bn_code: string;
      paypal_client_id: string;
      paypal_client_token: string;
      paypal_merchant_id: string;
    }>(endpoint, {
      params: {
        magic_client_id: magicClientId,
        contract_id: contractId,
      },
    });

    return {
      error: null,
      data: {
        paypalBnCode: response.paypal_bn_code,
        paypalClientId: response.paypal_client_id,
        paypalClientToken: response.paypal_client_token,
        paypalMerchantId: response.paypal_merchant_id,
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

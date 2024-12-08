import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { HttpService } from '../http';
import { NFTApiResponse } from './types';
import { NftTokenType } from 'alchemy-sdk';

export type FetchTokenInfoParams = {
  contractId: string;
  tokenId: string;
};

export type FetchTokenInfoResponse = {
  chainId: number;
  contractId: string;
  contractAddress: string;
  tokenType: NftTokenType;
  tokenId: string;
  price: string;
  denomination: string;
  usdRate: number;
  maxQuantity: number;
  mintedQuantity: number;
  isCryptoMintable: boolean;
};

export const fetchTokenInfo = async (params: FetchTokenInfoParams): Promise<NFTApiResponse<FetchTokenInfoResponse>> => {
  const endpoint = 'v1/nft/token_info';
  getLogger().info(`nft-api:, ${endpoint}`, params);

  const { contractId, tokenId } = params;

  try {
    const response = await HttpService.nft.get<{
      token_id: string;
      token: {
        contract_chain_id: number;
        contract_id: string;
        contract_address: string;
        contract_type: string;
        token_id: number;
        denomination: string;
        usd_rate: number;
        price: number;
        max_quantity: number;
        minted_quantity: number;
        contract_crypto_mint_function?: string;
      };
    }>(endpoint, {
      params: {
        contract_id: contractId,
        token_id: tokenId,
      },
    });

    return {
      error: null,
      data: {
        chainId: response.token.contract_chain_id,
        contractId: response.token.contract_id,
        contractAddress: response.token.contract_address,
        tokenType: (response?.token.contract_type ?? NftTokenType.ERC1155) as NftTokenType,
        tokenId: response.token.token_id.toString(),
        price: response.token.price.toString(),
        denomination: response.token.denomination,
        usdRate: response.token.usd_rate,
        maxQuantity: response.token.max_quantity,
        mintedQuantity: response.token.minted_quantity,
        isCryptoMintable: Boolean(response.token.contract_crypto_mint_function),
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

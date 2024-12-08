import { HttpService } from '../http';

type GetRequestStateParams = {
  publicAddress: string;
  chainId: number;
};

export type GasApiGetNonceAdditionResponse = {
  nonce_addition: number;
};

export const getNonceAddition = async ({ publicAddress, chainId }: GetRequestStateParams) => {
  const endpoint = 'v1/relayer/get-nonce-addition';

  const response = HttpService.gas.get<GasApiGetNonceAdditionResponse>(endpoint, {
    params: {
      public_address: publicAddress,
      chain_id: chainId,
    },
  });

  return response;
};

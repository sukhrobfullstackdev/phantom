import { HttpService } from '../http';
import { GasApiResponse } from '../http/gas-rest';

type GetRequestStateParams = {
  requestId: string;
};

export type GasApiGetRequestStateResponse = GasApiResponse & {
  tx_hash: string;
  tx_receipt: string;
  gas_spent: number;
};

export const getRequestState = async ({ requestId }: GetRequestStateParams) => {
  const endpoint = 'v1/relayer/get-request-state';

  const response = HttpService.gas.get<GasApiGetRequestStateResponse>(endpoint, {
    params: {
      request_id: requestId,
    },
  });

  return response;
};

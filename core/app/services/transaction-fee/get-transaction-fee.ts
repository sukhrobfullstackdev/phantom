import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type GetTransactionFeeResponseV1 = MagicAPIResponse<any>;
type GetTransactionFeeResponseV2 = MagicAPIResponse<any>;

export function getTransactionFeeV2(payload: any, wallet_id) {
  const endpoint = `v2/transaction/fee/retrieve?crypto=ETH&fiat=USD`;
  const body = {
    is_auth_user: true,
    wallet_id,
    payload,
    suggest_txn_fee: false,
  };
  return HttpService.magic.post<any, GetTransactionFeeResponseV2>(endpoint, body);
}

export function getTransactionFeeV1() {
  const endpoint = 'v1/transaction/fee/retrieve?crypto=ETH&fiat=USD';
  return HttpService.magic.get<GetTransactionFeeResponseV1>(endpoint);
}

export function getTransactionFeeV1EVMChain(endpoint) {
  return HttpService.json.get(endpoint);
}

export function getGasPriceEstimationRetrieve() {
  const endpoint = 'v1/ethereum/gas/price/estimation/retrieve';
  return HttpService.magic.get(endpoint);
}

import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type GetTokenPriceResponseV1 = MagicAPIResponse<any>;

export function GetTokenPrice(tokenSymbol = 'ETH', amount = '1') {
  const endpoint = `v1/currency/convert?from=${tokenSymbol}&to=USD&currency_amount=${amount}`;
  return HttpService.magic.get<GetTokenPriceResponseV1>(endpoint);
}

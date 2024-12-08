import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface ICreateOrderData {
  value: string;
  auth_user_id: string;
  channel: 'WEB' | 'APP';
}

interface ICreateOrderRequest {
  auth_user_id: string;
  wallet_type: string;
  intent: string;
  asset_symbol: string;
  country_code: string;
  region?: string;
  fiat_amount: {
    value: string;
    currency_code: string;
  };
  partner: {
    order_id?: string;
    redirect_url: string;
    account_id?: string;
    channel?: string;
  };
}

interface ICreateOrderResponse {
  country_code: string;
  create_time: number;
  fiat_amount: {
    currency_code: string;
    value: string;
  };
  id: string;
  intent: string;
  partner: {
    account_id: string;
    channel: string;
    name: string;
    order_id: string;
    redirect_url: string;
  };
  redirect_url: string;
  region: string;
  token: string;
}

const constructCreateOrderData = ({ value, auth_user_id, channel }: ICreateOrderData): ICreateOrderRequest => {
  return {
    auth_user_id,
    wallet_type: 'ETH',
    intent: 'TOPUP',
    asset_symbol: 'ETH',
    country_code: 'US',
    fiat_amount: {
      value,
      currency_code: 'USD',
    },
    partner: {
      redirect_url: 'https://wallet.magic.link/paypal',
      channel,
    },
  };
};

export async function createOrder(data: ICreateOrderData): Promise<ICreateOrderResponse> {
  // TODO some of this is hardcoded, pending configuration result
  const body = constructCreateOrderData(data);
  const endpoint = `/v1/paypal/crypto/order-entries`;
  const res = await HttpService.magic.post<ICreateOrderRequest, MagicAPIResponse<ICreateOrderResponse>>(endpoint, body);
  return res.data;
}

export function openURLInNewTab(url: string) {
  const newTab = window.open(url, '_blank', 'noopener noreferrer');
  newTab?.focus();
}

import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface IGetOrderData {
  auth_user_id: string;
  order_entry_id: string;
}

interface IOrder {
  asset_symbol: string;
  create_time: number;
  id: string;
  intent: string;
  links: string[];
  partner: {
    account_id: string;
    channel: string;
    name: string;
    order_id: string;
    redirect_url: string;
  };
  status: string;
  topup_summary: string;
  transaction_hash: string;
  type: string;
  update_time: number;
}

export interface IGetOrderResponse {
  orders: IOrder;
}

export async function getOrder(data: IGetOrderData): Promise<IGetOrderResponse> {
  const endpoint = `/v1/paypal/crypto/orders?auth_user_id=${data.auth_user_id}&order_entry_id=${data.order_entry_id}`;
  const res = await HttpService.magic.get<MagicAPIResponse<IGetOrderResponse>>(endpoint);
  return res.data;
}

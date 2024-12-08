import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { NFTApiResponse } from './types';
import { HttpService } from '../http';

export type CapturePaypalOrderParams = {
  orderId: string;
};

export type CapturePaypalOrderResponse = {
  isPaymentCapture: boolean;
  orderId: string;
  orderStatus: string;
  requestId: string;
};

export const capturePaypalOrder = async (
  params: CapturePaypalOrderParams,
): Promise<NFTApiResponse<CapturePaypalOrderResponse>> => {
  const endpoint = 'v1/nft/checkout/capture_order';
  getLogger().info(`nft-api:, ${endpoint}`, params);

  const { orderId } = params;

  try {
    const response = await HttpService.nft.post<
      { payment_provider_order_id: string },
      { is_payment_capture: boolean; order_id: string; order_status: string; request_id: string }
    >(endpoint, {
      payment_provider_order_id: orderId,
    });

    return {
      error: null,
      data: {
        isPaymentCapture: response.is_payment_capture,
        orderId: response.order_id,
        orderStatus: response.order_status,
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

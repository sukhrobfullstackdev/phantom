import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  getOrder,
  IGetOrderResponse,
} from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/service/get-order';
import { Step } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/types/paypal-types';

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const TEN_SECONDS = 10 * SECOND;
const FIVE_MINUTES = 5 * MINUTE;

const usePollOrder = (orderId: string | undefined, authUserId: string, handleError: () => void, previousStep: Step) => {
  const [intervalMs, setIntervalMs] = useState(TEN_SECONDS);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleMaxPollingTime = (maxPollingTime: number) => {
    if (timeElapsed >= maxPollingTime) {
      handleError();
    } else {
      setIntervalMs(intervalMs * 2);
    }
  };

  const { data } = useQuery({
    queryKey: [orderId],
    enabled: !!orderId,
    refetchInterval: intervalMs,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const getOrderData = await getOrder({
        auth_user_id: authUserId,
        order_entry_id: orderId as string,
      }).catch(error => {
        handleMaxPollingTime(DAY);
      });

      if (!getOrderData) return {} as IGetOrderResponse;

      const status: Exclude<Step, 'COMPOSE'> = getOrderData?.orders?.[0]?.status;

      if (previousStep !== status) {
        setIntervalMs(TEN_SECONDS);
        setTimeElapsed(0);
      }

      if (status === 'INITIATED' && timeElapsed >= FIVE_MINUTES) {
        handleMaxPollingTime(HOUR);
      } else if (status === 'PENDING' && timeElapsed >= HOUR) {
        handleMaxPollingTime(DAY);
      } else if (status === 'COMPLETED') {
        setIntervalMs(0); // stop polling
      } else if (status === 'FAILED') {
        handleError();
      }

      setTimeElapsed(prevTime => prevTime + intervalMs);
      return getOrderData;
    },
  });

  const orderStatus: Step = data?.orders?.[0]?.status;
  const orderTransactionLink: string | undefined = data?.orders?.[0]?.links?.[0]?.href;

  return { orderStatus, orderTransactionLink };
};

export default usePollOrder;

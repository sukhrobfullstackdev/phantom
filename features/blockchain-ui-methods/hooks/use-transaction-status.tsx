import { useState } from 'react';
import { ethereumProxy } from '~/app/services/json-rpc/ethereum-proxy';
import { TransactionStatus } from '~/features/connect-with-ui/components/transaction-status';
import { getPayloadId } from '~/features/connect-with-ui/utils/get-payload-id';
import { useInterval } from '~/features/native-methods/hooks/use-interval';
import { BigNumber as BN } from 'bignumber.js';

export const TRANSACTION_STATUS = {
  PROCESSING: 'PROCESSING',
  SUCCESSED: 'SUCCESSED',
  FAILED: 'FAILED',
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUS;

type Props = {
  hash: string;
};

const MAXIMUM_RETRY_COUNT = 3;

export const useTransactionStatus = ({ hash }: Props) => {
  const [status, setStatus] = useState<TransactionStatus>(TRANSACTION_STATUS.PROCESSING);
  const [retry, setRetry] = useState(0);

  useInterval(
    async () => {
      if (!hash) {
        console.warn('Waitting for transaction hash');
        return;
      }

      try {
        const receipt = await ethereumProxy<{ status: string }>({
          id: getPayloadId(),
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [hash],
        });

        if (!receipt || new BN(receipt.status).eq(0)) {
          if (retry > MAXIMUM_RETRY_COUNT) {
            setStatus(TRANSACTION_STATUS.FAILED);
            return;
          }
          setRetry(prev => prev + 1);
          return;
        }

        if (new BN(receipt.status).eq(1)) {
          setStatus(TRANSACTION_STATUS.SUCCESSED);
          return;
        }
      } catch {
        setStatus(TRANSACTION_STATUS.FAILED);
        return;
      }
    },
    status === TRANSACTION_STATUS.PROCESSING ? 1000 : null,
  );

  return { status };
};

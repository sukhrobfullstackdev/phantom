import { useMutation } from '@tanstack/react-query';
import { useTransactionHash } from './use-transaction-hash';
import { useCloseUIThread, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { resolvePayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';

export const useCloseSendTransaction = () => {
  const payload = useUIThreadPayload();
  const { transactionHash } = useTransactionHash();
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());

  const { mutateAsync: closeSendTransaction } = useMutation<void>({
    mutationFn: async () => {
      if (!payload || !transactionHash) {
        cancel();
        return;
      }

      await resolvePayload<string>(payload, transactionHash);
    },
  });

  return { closeSendTransaction };
};

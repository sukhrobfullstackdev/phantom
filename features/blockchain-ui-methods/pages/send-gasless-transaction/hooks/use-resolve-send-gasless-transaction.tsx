import { useCloseUIThread, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useGasApiResponse } from './use-gas-api-response';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { useMutation } from '@tanstack/react-query';
import { resolvePayload } from '~/app/rpc/utils';
import { useControllerContext } from '~/app/ui/hooks/use-controller';

export const useResolveSendGalssTransaction = () => {
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());
  const payload = useUIThreadPayload();
  const { gasApiResponse, clearGasApiResponse } = useGasApiResponse();
  const { isPageActive } = useControllerContext();

  const { mutateAsync: resolveSendGaslessTransaction } = useMutation({
    mutationFn: async () => {
      if (!payload) {
        cancel();
        return;
      }

      const isError = isPageActive('eth-send-gasless-transaction-error');
      if (isError) {
        if (gasApiResponse) {
          await resolvePayload(payload, {
            success: false,
            request_id: gasApiResponse.request_id,
            state: gasApiResponse.state,
          });
        } else {
          await resolvePayload(payload, {
            success: false,
          });
        }
        return;
      }

      if (!gasApiResponse) {
        cancel();
        return;
      }

      await resolvePayload(payload, {
        success: gasApiResponse.success,
        request_id: gasApiResponse.request_id,
        state: gasApiResponse.state,
      });
    },
    onSettled: () => {
      clearGasApiResponse();
    },
  });

  return { resolveSendGaslessTransaction };
};

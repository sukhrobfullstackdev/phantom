import { useQuery } from '@tanstack/react-query';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { calculateNetworkFee } from '~/app/libs/web3-utils';

export const useNetworkFee = () => {
  const payload = useUIThreadPayload();

  const { data: networkFee, ...rest } = useQuery<string>(
    ['network-fee', payload?.params],
    async () => {
      const response = await calculateNetworkFee(payload);
      return response;
    },
    {
      enabled: !!payload,
    },
  );

  return { networkFee: networkFee!, ...rest };
};

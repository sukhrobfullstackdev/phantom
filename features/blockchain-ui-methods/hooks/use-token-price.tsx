import { useQuery } from '@tanstack/react-query';
import { GetTokenPrice } from '~/app/services/token-price/token-price';
import { useChainInfo } from './use-chain-info';

export const useTokenPrice = () => {
  const { chainInfo } = useChainInfo();

  const { data: tokenPrice, ...rest } = useQuery<string>({
    queryKey: ['token-price', chainInfo.chainId],
    queryFn: async () => {
      if (chainInfo.network === 'global-trust-network') {
        return '0';
      }

      const res = await GetTokenPrice(chainInfo.currency);
      return res?.data.to_currency_amount_display as string;
    },
    suspense: true,
    staleTime: Infinity,
  });

  return { tokenPrice: tokenPrice!, ...rest };
};

import { useContext } from 'react';
import useSWR from 'swr';
import { GetTokenPrice } from '~/app/services/token-price/token-price';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';

export function useGetTokenPrice(): string | undefined {
  const chainInfo = useContext(MultiChainInfoContext);
  const token = chainInfo?.currency;
  if (!token) return undefined;
  const { data, error } = useSWR(token, GetTokenPrice, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // refetch data every 30 seconds
  });
  if (error) return '0';
  const price = data?.data?.to_currency_amount_display;
  return price || undefined;
}

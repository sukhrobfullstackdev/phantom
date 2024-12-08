import useSWR from 'swr';
import { store } from '~/app/store';
import LedgerBalance from '~/app/libs/ledger-balance';

export function useGetNativeTokenBalance(walletAddress?: string): string | undefined {
  const address = walletAddress || store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const ledgerBalance = new LedgerBalance();
  const { data, error } = useSWR(address, ledgerBalance.getBalance(), {
    revalidateOnFocus: false,
    refreshInterval: 15000, // refetch data every 15 seconds
  });
  if (error) return '0x0';
  return data || undefined;
}

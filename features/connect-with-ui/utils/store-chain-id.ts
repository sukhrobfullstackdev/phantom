import { isGlobalAppScope, isMagicWalletDapp } from '~/app/libs/connect-utils';
import { HttpService } from '~/app/services/http';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';

export const storeChainId = (userID, walletId, chainId) => {
  const isMainnet = networksByChainId[chainId || '']?.isMainnet;
  if (!isGlobalAppScope() || isMagicWalletDapp() || !isMainnet || !chainId) return;
  const endpoint = 'v1/core/wallet/chain_id';
  const body = {
    auth_user_id: userID,
    wallet_id: walletId,
    chain_id: chainId,
    wallet_scope: 'connect',
  };
  return HttpService.magic.post<any>(endpoint, body).catch(console.error);
};

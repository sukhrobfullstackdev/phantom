import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { store } from '~/app/store';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { isSdkVersionGreaterThanOrEqualTo } from '~/app/libs/is-version-greater-than';
import { connectStore } from '~/features/connect-with-ui/store';

const getWalletInfoMiddleware = async ({ payload }) => {
  const { activeThirdPartyWallet } = connectStore.getState();
  const activeWallet = isSdkVersionGreaterThanOrEqualTo('17.0.0')
    ? payload.params[0]?.walletType
    : activeThirdPartyWallet;
  if (activeWallet) {
    return resolvePayload(payload, {
      walletType: activeWallet.toLocaleLowerCase(),
    });
  }

  const isLoggedInWithMagic = store.getState().Auth.userID;
  if (isLoggedInWithMagic) {
    return resolvePayload(payload, { walletType: 'magic' });
  }

  return rejectPayload(payload, sdkErrorFactories.client.userDeniedAccountAccess());
};

const mc_get_wallet_info: RpcRouteConfig = {
  middlewares: [atomic(), getWalletInfoMiddleware],
};

export default createFeatureModule.RPC(mc_get_wallet_info);

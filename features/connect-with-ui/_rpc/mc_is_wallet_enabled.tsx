import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { store } from '~/app/store';

const isWalletTypeEnabledMiddleware = async ({ payload }) => {
  let walletType = payload.params[0].wallet; // 'metamask' | 'coinbase_wallet'

  if (!walletType) {
    return rejectPayload(payload, sdkErrorFactories.rpc.invalidParamsError());
  }

  // Ensure type matches wallet naming convention in `primary_login_providers`
  if (walletType === 'metamask') {
    walletType = 'metamask_wallet';
  }
  const {
    configuredAuthProviders: { primaryLoginProviders },
  } = store.getState().System;

  return resolvePayload(payload, primaryLoginProviders.includes(walletType));
};

const mc_is_wallet_enabled: RpcRouteConfig = {
  middlewares: [atomic(), isWalletTypeEnabledMiddleware],
};

export default createFeatureModule.RPC(mc_is_wallet_enabled);

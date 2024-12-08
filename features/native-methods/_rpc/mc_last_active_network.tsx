import { isMagicWalletDapp } from '~/app/libs/connect-utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { store } from '~/app/store';
import { createFeatureModule } from '~/features/framework';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';

type LastActiveNetworkReturnValue = 'ethereum' | 'polygon' | 'optimism';

const formatNetworkToReturn = (network): LastActiveNetworkReturnValue => {
  if (network === 'optimistic-mainnet') return 'optimism';
  if (network === 'polygon-mainnet') return 'polygon';
  return 'ethereum';
};

const getLastActiveChainIdMiddleware = async ({ payload }) => {
  try {
    const { usedChainIds } = store.getState().User;
    const chainId = usedChainIds?.[0] || '137';
    const lastActiveNetwork = networksByChainId[chainId];
    const network = formatNetworkToReturn(lastActiveNetwork?.network);
    return resolvePayload(payload, network);
  } catch (e) {
    return resolvePayload(payload, 'ethereum');
  }
};

const rejectIfNotMagicWalletDapp = async (ctx, next) => {
  if (!isMagicWalletDapp()) {
    return rejectPayload(ctx.payload, sdkErrorFactories.magic.unsupportedSDKMethodForGlobalWalletApps());
  }
  next();
};

const mc_last_active_network: RpcRouteConfig = {
  middlewares: [atomic(), rejectIfNotMagicWalletDapp, getLastActiveChainIdMiddleware],
};

export default createFeatureModule.RPC(mc_last_active_network);

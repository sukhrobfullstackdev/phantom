import { MagicUserMetadata } from 'magic-sdk';
import { createFeatureModule } from '~/features/framework';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { GetMetadataThunks } from '../store/get-metadata.thunks';
import { resolvePayload } from '~/app/rpc/utils';
import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { store } from '~/app/store';
import { connectStore } from '~/features/connect-with-ui/store';
import { RpcMiddleware } from '~/app/rpc/types';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';

export const tryResolveThirdPartyWalletType: RpcMiddleware = async ({ payload }, next) => {
  const { activeThirdPartyWallet } = connectStore.getState();
  const activeWallet = payload.params[0]?.walletType || activeThirdPartyWallet;
  if (activeWallet) {
    return resolvePayload(payload, {
      walletType: activeWallet.toLocaleLowerCase(),
      phoneNumber: undefined,
      isMfaEnabled: false,
      email: undefined,
    });
  }
  next();
};

export const magicGetInfo = async ({ payload, dispatch }) => {
  const userInfo = await dispatch(GetMetadataThunks.formatMagicUserMetadata());
  userInfo.walletType = 'magic';
  if (isGlobalAppScope()) {
    userInfo.phoneNumber = undefined;
    userInfo.isMfaEnabled = false;
    userInfo.email = store.getState().Auth.userConsent?.email ? userInfo.email : undefined;
    const { activeThirdPartyWallet } = connectStore.getState();
    if (activeThirdPartyWallet) {
      userInfo.walletType = activeThirdPartyWallet.toLocaleLowerCase();
    }
  }
  return resolvePayload<MagicUserMetadata>(payload, userInfo);
};

export default createFeatureModule.RPC({
  middlewares: [atomic(), tryResolveThirdPartyWalletType, hydrateUserOrReject, magicGetInfo],
});

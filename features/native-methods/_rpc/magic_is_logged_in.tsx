import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { getPayloadData, handleHydrateUser } from '~/app/rpc/utils';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { connectStore } from '~/features/connect-with-ui/store';

export const magicIsLoggedinMiddleware = async ({ payload, dispatch, getState }) => {
  let isLoggedIn = false;
  await connectStore.ready;
  const thirdPartyWalletType = connectStore.getState().activeThirdPartyWallet;
  if (thirdPartyWalletType) {
    isLoggedIn = true;
  } else {
    const { jwt, rt } = getPayloadData(payload);
    const hydrated = await handleHydrateUser({ jwt, rt });
    isLoggedIn = hydrated && !!getState().Auth.ust;
  }
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: isLoggedIn }));
};

const magic_is_logged_in: RpcRouteConfig = {
  middlewares: [atomic(), magicIsLoggedinMiddleware],
};

export default createFeatureModule.RPC(magic_is_logged_in);

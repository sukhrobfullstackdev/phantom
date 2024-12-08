import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { globalCache } from '~/shared/libs/cache';
import { setUserKeys } from '~/app/store/auth/auth.actions';
import { SystemThunks } from '~/app/store/system/system.thunks';

const clear_keys_and_cache: RpcRouteConfig = {
  middlewares: [
    atomic(),
    ({ payload, dispatch }) => {
      dispatch(setUserKeys({ authUserId: '' }));
      globalCache.clear();
      return dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: true }));
    },
  ],
};

export default createFeatureModule.RPC(clear_keys_and_cache);

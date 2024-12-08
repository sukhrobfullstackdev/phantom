import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { resolvePayload } from '~/app/rpc/utils';
import { connectLogout } from '../../connect-with-ui/store/connect.thunks';
import { connectStore } from '../../connect-with-ui/store';

export const magicDisconnectMiddleware = async ({ payload }) => {
  await connectStore.dispatch(connectLogout());
  await resolvePayload(payload, true);
};

const magic_disconnect: RpcRouteConfig = {
  middlewares: [atomic(), magicDisconnectMiddleware],
};

export default createFeatureModule.RPC(magic_disconnect);

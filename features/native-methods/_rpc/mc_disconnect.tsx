import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { magicDisconnectMiddleware } from './magic_disconnect';

const mc_disconnect: RpcRouteConfig = {
  // rerouted to magic_disconnect. see magicRerouteRPC
  middlewares: [atomic(), magicDisconnectMiddleware],
};

export default createFeatureModule.RPC(mc_disconnect);

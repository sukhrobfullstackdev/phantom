import { createFeatureModule } from '~/features/framework';
import { RpcRoute } from '~/app/rpc/utils/rpc-router';

const {{routeName}} = new RpcRoute(async ({ payload, dispatch }, next) => {
  // my rpc logic
  next();
});

export default createFeatureModule.RPC({{routeName}});

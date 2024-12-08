import { createFeatureModule } from '~/features/framework';
import { forwardEthMethodToCoreRpcHandler } from '../../../utils/forward-eth-method-to-core-rpc-handler';

export default createFeatureModule.RPC({
  middlewares: [forwardEthMethodToCoreRpcHandler],
});

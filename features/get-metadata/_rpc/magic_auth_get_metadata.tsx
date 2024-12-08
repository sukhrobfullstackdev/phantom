import { createFeatureModule } from '~/features/framework';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { magicGetInfo } from './magic_get_info';

export default createFeatureModule.RPC({
  middlewares: [atomic(), hydrateUserOrReject, magicGetInfo],
});

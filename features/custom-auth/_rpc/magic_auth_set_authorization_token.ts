import { createFeatureModule } from '~/features/framework';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import {
  marshallAuthorizationJwtParams,
  setAuthorizationMiddleware,
} from '~/features/custom-auth/set-authorization-token.controller';

export default createFeatureModule.RPC({
  middlewares: [atomic(), ifGlobalAppScopeRejectMagicRPC, marshallAuthorizationJwtParams, setAuthorizationMiddleware],
});

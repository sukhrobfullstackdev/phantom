import { createFeatureModule } from '~/features/framework';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { marshallOIDCParams, oidcLoginMiddleware } from '~/features/login-with-oidc/login-with-oidc.controller';

export default createFeatureModule.RPC({
  middlewares: [atomic(), ifGlobalAppScopeRejectMagicRPC, marshallOIDCParams, oidcLoginMiddleware],
});

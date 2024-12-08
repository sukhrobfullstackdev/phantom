import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { createFeatureModule } from '~/features/framework';
import {
  marshallParseOAuthResultParams,
  compareOAuthState,
  getOAuthAccessToken,
  resolveOAuthFlow,
} from '../controllers/client/rpc-redirect';

export default createFeatureModule.RPC({
  middlewares: [
    ifGlobalAppScopeRejectMagicRPC,
    marshallParseOAuthResultParams,
    compareOAuthState,
    getOAuthAccessToken,
    resolveOAuthFlow,
  ],
});

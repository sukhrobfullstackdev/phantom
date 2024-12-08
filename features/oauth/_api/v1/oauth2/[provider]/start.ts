import { createFeatureModule } from '~/features/framework';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { oauthAuthorization } from '~/features/oauth/controllers/server/authorization';
import { disallowIframe } from '~/server/middlewares/security';

export default createFeatureModule.API({
  get: composeMiddleware(disallowIframe, oauthAuthorization),
});

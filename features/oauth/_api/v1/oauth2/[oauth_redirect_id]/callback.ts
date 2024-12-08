import { createFeatureModule } from '~/features/framework';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { oauthCallback } from '~/features/oauth/controllers/server/callback';
import { disallowIframe } from '~/server/middlewares/security';

export default createFeatureModule.API({
  get: composeMiddleware(disallowIframe, oauthCallback as any),
  post: composeMiddleware(disallowIframe, oauthCallback as any),
});

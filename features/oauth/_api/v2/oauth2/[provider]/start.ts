import { createFeatureModule } from '~/features/framework';
import { oauthDetourStart } from '~/features/oauth/controllers/server/detour-start';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { disallowIframe } from '~/server/middlewares/security';

export default createFeatureModule.API({
  get: composeMiddleware(disallowIframe, oauthDetourStart),
});

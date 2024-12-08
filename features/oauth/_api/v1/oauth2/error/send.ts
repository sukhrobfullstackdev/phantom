import { createFeatureModule } from '~/features/framework';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { oauthSendErrorViaQueryParameters } from '~/features/oauth/controllers/server/send-error';
import { disallowIframe } from '~/server/middlewares/security';

export default createFeatureModule.API({
  get: composeMiddleware(disallowIframe, oauthSendErrorViaQueryParameters as any),
});

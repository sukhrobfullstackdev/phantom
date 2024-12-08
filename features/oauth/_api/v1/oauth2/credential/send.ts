import { createFeatureModule } from '~/features/framework';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { oauthSendCredentialViaQueryParameters } from '~/features/oauth/controllers/server/send-credential';
import { disallowIframe } from '~/server/middlewares/security';

export default createFeatureModule.API({
  get: composeMiddleware(disallowIframe, oauthSendCredentialViaQueryParameters),
});

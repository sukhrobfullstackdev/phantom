import { createFeatureModule } from '~/features/framework';
import {
  buildProviderUri,
  generatePKCE,
  getAppDetails,
  getOauthRedirectUri,
  getOauthStartParams,
  persistMetaData,
  validateRedirectUrl,
} from '../controllers/client/start';

export default createFeatureModule.RPC({
  middlewares: [
    getOauthStartParams,
    validateRedirectUrl,
    getAppDetails,
    generatePKCE,
    getOauthRedirectUri,
    persistMetaData,
    buildProviderUri,
  ],
});

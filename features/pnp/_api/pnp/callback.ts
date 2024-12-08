import { createFeatureModule } from '~/features/framework';
import { pnpMiddlewareWithOAuth } from '../../pnp-middleware';

export default createFeatureModule.API({
  get: pnpMiddlewareWithOAuth,
});

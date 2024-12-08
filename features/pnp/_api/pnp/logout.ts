import { createFeatureModule } from '~/features/framework';
import { pnpMiddleware } from '../../pnp-middleware';

export default createFeatureModule.API({
  get: pnpMiddleware,
});

import { createFeatureModule } from '~/features/framework';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { handleErrorsClientSide } from '~/server/middlewares/error-handlers';
import { handler } from '~/server/middlewares/handler-factory';
import { createJSDelivrPathRewriter } from '../../../jsdelivr-path-rewriter';
import { JSDelivrProxyMiddleware } from '../../../jsdelivr-proxy-middleware';

export default createFeatureModule.API({
  get: composeMiddleware(
    handler<{ name: string }>((req, res, next) =>
      createJSDelivrPathRewriter(`@magic-ext/${req.params.name}`)(req, res, next),
    ),
    JSDelivrProxyMiddleware,
    handleErrorsClientSide,
  ),
});

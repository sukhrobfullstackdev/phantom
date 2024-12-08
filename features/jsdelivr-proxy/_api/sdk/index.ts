import { createFeatureModule } from '~/features/framework';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { handleErrorsClientSide } from '~/server/middlewares/error-handlers';
import { createJSDelivrPathRewriter } from '../../jsdelivr-path-rewriter';
import { JSDelivrProxyMiddleware } from '../../jsdelivr-proxy-middleware';

export default createFeatureModule.API({
  get: composeMiddleware(createJSDelivrPathRewriter('magic-sdk'), JSDelivrProxyMiddleware, handleErrorsClientSide),
});

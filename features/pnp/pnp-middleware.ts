import { resolve } from 'path';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { handleErrorsClientSide } from '~/server/middlewares/error-handlers';
import { createJSDelivrPathRewriter } from '~/features/jsdelivr-proxy/jsdelivr-path-rewriter';
import { JSDelivrProxyMiddleware } from '~/features/jsdelivr-proxy/jsdelivr-proxy-middleware';
import { handler } from '~/server/middlewares/handler-factory';

export const pnpMiddlewareWithOAuth = composeMiddleware(
  createJSDelivrPathRewriter('magic-sdk', '@magic-ext/oauth', '@magic-sdk/pnp'),
  JSDelivrProxyMiddleware,
  handleErrorsClientSide,
);

export const pnpMiddleware = composeMiddleware(
  createJSDelivrPathRewriter('magic-sdk', '@magic-sdk/pnp'),
  JSDelivrProxyMiddleware,
  handleErrorsClientSide,
);

// For development-purposes only, we can create a `pnp.js` file at the root of
// this feature to serve a custom version of the PNP library.
export const pnpLocalMiddleware = handler((req, res, next) => {
  res.status(200).sendFile(resolve(__dirname, './pnp.js'));
});

import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { proxyHandler, handler } from '~/server/middlewares/handler-factory';

export const JSDelivrProxyMiddleware = composeMiddleware(
  handler((req, res, next) => {
    // Prevents a bad 5xx error that can occur when evil bots are trying to
    // access this endpoint with a bad `trailer` header. We don't support
    // `trailer` headers through the JSDelivr proxy and it presents a
    // vulnerability if misued.
    //
    // see [ch47627]: https://app.shortcut.com/magic-labs/story/47627/incident-auth-relayer-5xx
    delete req.headers.trailer;
    next();
  }),

  proxyHandler('https://cdn.jsdelivr.net', {
    changeOrigin: true,
  }),
);

import { Application } from 'express';
import createDevMiddleware from 'webpack-dev-middleware';
import createHotMiddleware from 'webpack-hot-middleware';
import { createCompiler } from './create-compiler';
import { publicPath } from './webpack-utils';
import { addShutdownListener } from '../libs/graceful-shutdown';
import { handler } from '../middlewares/handler-factory';

export async function initDevServer(app: Application) {
  const compiler = await createCompiler();

  const devMiddleware = createDevMiddleware(compiler, {
    publicPath,
    stats: 'errors-warnings',
    logLevel: 'warn',

    // Fix an infinite reload loop that happens sometimes when using linked
    // node_modules.
    // @see https://github.com/nuxt/nuxt.js/issues/3828
    headers: {
      'Cache-Control': 'no-store',
      Vary: '*',
    },
  });

  const hotMiddleware = createHotMiddleware(compiler, { log: false });

  addShutdownListener('Shutting down Webpack dev middleware', () => {
    devMiddleware.close();
  });

  app.use(devMiddleware);
  app.use(hotMiddleware);

  app.use(
    handler((req, res, next) => {
      devMiddleware.waitUntilValid(() => next());
    }),
  );
}

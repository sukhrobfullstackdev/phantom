import http, { Server } from 'http';
import express, { Application } from 'express';
import chalk from 'chalk';
import cors from 'cors';
import { APP_PORT } from './constants/env';
import { IS_NODE_ENV_DEV, IS_NODE_ENV_PROD } from '~/shared/constants/env';
import * as Routes from './routes';
import { isRouter } from './libs/validators';
import { initDevServer } from './webpack/development';
import { useGracefulShutdown } from './libs/graceful-shutdown';
import { prettyConsole } from './libs/pretty-console';

// Global Middlewares
import { expressExtensions, parseCookies, parseHeaders } from './middlewares/express-extensions';
import { notFound, handleErrorsJSON } from './middlewares/error-handlers';
import { logRequests } from './middlewares/logging';
import { security } from './middlewares/security';
import { applyFeatureFrameworkRoutes, dynamicFeatureMiddleware } from './middlewares/feature-controller';

/**
 * Adds or removes global Express configuration.
 */
async function configuration(app: Application) {
  app.enable('trust proxy');
}

/**
 * Global middlewares applied BEFORE ROUTING.
 */
async function beforewares(app: Application) {
  app.use(logRequests);
  app.use(expressExtensions);

  if (IS_NODE_ENV_DEV) app.use(cors());
  if (IS_NODE_ENV_PROD) app.use(security);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(parseCookies);
  app.use(parseHeaders);

  if (IS_NODE_ENV_DEV) await initDevServer(app);
}

/**
 * Global middlewares applied AFTER ROUTING.
 */
async function afterwares(app: Application) {
  app.use(notFound);

  // Error middlewares should always be last!
  app.use(handleErrorsJSON);
}

/**
 * Inject all routers.
 */
async function routes(app: Application) {
  // Core routes
  [...Object.values(Routes)].forEach(maybeRouter => {
    if (isRouter(maybeRouter)) app.use(maybeRouter);
  });

  app.use(dynamicFeatureMiddleware.handler);

  await applyFeatureFrameworkRoutes();
}

/**
 * Start the server listening so it can handle requests.
 */
async function listen(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server
      .listen(APP_PORT, () => {
        prettyConsole.spacer();
        console.log(chalk`{bold ✅ Completed initialization!}`);
        console.log(chalk`{bold 📡 Server is listening on port} {cyan ${APP_PORT}}`);
        prettyConsole.spacer();
        resolve();
      })
      .on('error', err => {
        reject(err);
      });
  });
}

/**
 * Setup the Express JS application with global before/after-wares and routes,
 * then start listening.
 */
export async function api() {
  const app = express();
  const server = http.createServer(app);

  useGracefulShutdown(server);

  await configuration(app);
  await beforewares(app);
  await routes(app);
  await afterwares(app);
  await listen(server);
}

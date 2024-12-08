import { Router } from 'express';
import { loadFeature } from '~/server/libs/load-feature';
import { getAllServerSideRoutes } from '~/server/libs/feature-framework/route-mapping';
import { DynamicMiddleware } from './dynamic-middleware';
import { renderSPA } from './render-spa';

export const dynamicFeatureMiddleware = new DynamicMiddleware();

/**
 * Dynamically injects all API & page routes from the
 * feature framework into the Express application.
 */
export async function applyFeatureFrameworkRoutes() {
  dynamicFeatureMiddleware.clear();

  const routes = await getAllServerSideRoutes();

  const featureRouter = Router();

  const featureAPIModules = Object.fromEntries(
    await Promise.all(
      routes._api.map(async entry => {
        return [entry.path, (await loadFeature(entry.featureName, 'API', entry.modulePath)).default];
      }),
    ),
  );

  for (const entry of routes.allSorted) {
    if (entry.routeType === '_api') {
      const featureAPIModule = featureAPIModules[entry.path];
      Object.entries(featureAPIModule).forEach(([method, handler]) => {
        featureRouter[method](entry.path, handler);
      });
    } else if (entry.routeType === '_pages') {
      featureRouter.get(entry.path, renderSPA());
    }
  }

  // Apply middlewares
  dynamicFeatureMiddleware.use(featureRouter);
}

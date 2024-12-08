import express from 'express';
import path from 'path';
import { createFeatureModule } from '~/features/framework';
import { resolveToRoot } from '~/server/libs/path-utils';
import { handler } from '~/server/middlewares/handler-factory';

const staticHandler = express.static(resolveToRoot('build', 'static'));

export default createFeatureModule.API({
  get: handler((req, res, next) => {
    req.url = path.relative(req.route.path.replace('*', ''), req.originalUrl);
    return staticHandler(req, res, next);
  }),
});

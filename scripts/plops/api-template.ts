import { createFeatureModule } from '~/features/framework';
import { createResponseJson } from '~/server/libs/response';
import { handler } from '~/server/middlewares/handler-factory';

export default createFeatureModule.API({
  get: handler((req, res, next) => {
    res.status(200).json(createResponseJson({ hello: 'world' }));
  }),
});

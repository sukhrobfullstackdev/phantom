import { Router } from 'express';
import { renderSPA } from '~/server/middlewares/render-spa';
import { ClientEndpoint } from './client.endpoint';
import { allowIframe, disallowIframe } from '~/server/middlewares/security';
import { handler } from '~/server/middlewares/handler-factory';
import { validateErrorSignature } from '~/server/libs/exceptions';

export const ClientRouter = Router();

ClientRouter.get(
  ClientEndpoint.ErrorV1,
  disallowIframe,
  handler((req, res, next) => {
    if (validateErrorSignature(req.query.s as string, req.query as any)) {
      return next();
    }
    res.redirect('/'); // Rewrite to index route (forces a 404/not found)
  }),
  renderSPA(),
);

ClientRouter.get(
  [
    ClientEndpoint.ConfirmV1,
    ClientEndpoint.LoginV1,
    ClientEndpoint.ConfirmEmailV1,
    ClientEndpoint.ConfirmNFTTransferV1,
    ClientEndpoint.NewDeviceV1,
  ],
  disallowIframe,
  renderSPA(),
);

ClientRouter.get(
  [ClientEndpoint.SendV1, ClientEndpoint.SendLegacy, ClientEndpoint.PreviewV1],
  allowIframe,
  renderSPA(),
);

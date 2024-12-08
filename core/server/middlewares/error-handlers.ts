import qs from 'qs';
import { createResponseJson } from '../libs/response';
import {
  coreHttpErrors,
  isHttpError,
  createHttpError,
  assertErrorCode,
  AuthRelayerErrorCode,
  createErrorSignature,
} from '../libs/exceptions';
import { renderSPA } from './render-spa';
import { handler, errorHandler } from './handler-factory';
import { Endpoint } from '../routes/endpoint';
import { serverLogger } from '../libs/datadog';

/**
 * Forwards a 404 (not found) route directly to the error handlers.
 */
export const notFound = handler(async (req, res, next) => {
  serverLogger.error('Relayer route not found: ', { req, res });
  throw coreHttpErrors.NotFound();
});

/**
 * Custom Express error handler that redirects error handling to the frontend.
 * This is used to show errors in a friendly UI for users or developers during
 * certain flows.
 */
export const handleErrorsClientSide = errorHandler(async (error, req, res, next) => {
  if (!res.headersSent) {
    const fallbackError = error instanceof Error ? error : coreHttpErrors.InternalServiceError();
    const resolvedError = isHttpError(error) ? error : createHttpError({ sourceErrors: fallbackError });

    if (assertErrorCode(resolvedError, AuthRelayerErrorCode.NotFound)) {
      // The `app` SPA can render a friendly 404 UI upon captured `GET` requests.
      await renderSPA(404)(req, res, next);
    } else {
      const errSig = createErrorSignature(resolvedError);
      const queryString = qs.stringify({
        error_code: resolvedError.error_code,
        message: resolvedError.message,
        s: errSig,
      });
      res.status(resolvedError.status).redirect(`${Endpoint.Client.ErrorV1}?${queryString}`);
    }
  }
});

/**
 * Custom Express error handler that automatically formats errors to the
 * expected JSON schema.
 */
export const handleErrorsJSON = errorHandler(async (error, req, res, next) => {
  if (!res.headersSent) {
    const fallbackError = error instanceof Error ? error : coreHttpErrors.InternalServiceError();
    const resolvedError = isHttpError(error) ? error : createHttpError({ sourceErrors: fallbackError });

    if (assertErrorCode(resolvedError, AuthRelayerErrorCode.NotFound) && req.method === 'GET') {
      // The `app` SPA can render a friendly 404 UI upon captured `GET` requests.
      await renderSPA(404)(req, res, next);
    } else {
      res.status(resolvedError.status).json(createResponseJson(resolvedError));
    }
  }
});

import { RequestHandler, ErrorRequestHandler, Params, ParamsDictionary } from 'express';
import { HttpError } from 'http-errors';
import { createHttpError } from '../libs/exceptions';
import { proxyServer, ProxyServerOptions } from '../libs/proxy-server';

/**
 * Creates an Express middleware with it's type signature coerced to a
 * contextual `RequestHandler` (including strong typing of the `params`
 * dictionary). Middlewares created with this factory will automatically handle
 * asynchronous errors.
 */
export function handler<T extends Params = ParamsDictionary>(requestHandler: RequestHandler<T>): RequestHandler<T> {
  const promisifiedHandler: RequestHandler<T> = async (req, res, next) => {
    try {
      const result = requestHandler(req, res, next);
      return Promise.resolve(result).catch(next); // Forward asynchronous errors to `next`
    } catch (e) {
      // Forward synchronous errors to `next`
      next(e);
    }
  };

  return promisifiedHandler;
}

/**
 * Creates an Express error middleware with it's type signature coerced to a
 * contextual `ErrorRequestHandler` (including strong typing of the `params`
 * dictionary). Middlewares created with this factory will automatically handle
 * asynchronous errors.
 */
export function errorHandler<T extends Params = ParamsDictionary>(
  errorRequestHandler: ErrorRequestHandler<T>,
): ErrorRequestHandler<T> {
  const promisifiedHandler: ErrorRequestHandler<T> = async (err, req, res, next) => {
    try {
      req.ext.currentError = err ?? undefined;
      const result = errorRequestHandler(err, req, res, next);
      return Promise.resolve(result).catch(next); // Forward asynchronous errors to `next`
    } catch (e) {
      // Forward synchronous errors to `next`
      next(e);
    }
  };

  return promisifiedHandler;
}

/**
 * Creates an Express middleware which proxies the incoming request to another
 * origin. Uses `http-proxy` under the hood.
 */
export function proxyHandler(
  target: string,
  options: Omit<ProxyServerOptions, 'target'> & { errorTransform?: (err: any) => HttpError } = {},
) {
  return handler((req, res, next) => {
    req.ext.proxyDetails.target = target;
    const { errorTransform = err => next(createHttpError({ sourceErrors: err })), ...otherOptions } = options;

    return proxyServer.web(
      req,
      res,
      { target, ...otherOptions },

      errorTransform,
    );
  });
}

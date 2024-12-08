import { ErrorRequestHandler, Params, ParamsDictionary, RequestHandler } from 'express';
import { composeErrorMiddleware, composeMiddleware, Handlers } from './compose-middleware';
import { errorHandler, handler } from './handler-factory';

/**
 * A middleware that can push and unshift Express handlers dynamically.
 */
export class DynamicMiddleware<T extends Params = ParamsDictionary> {
  public middlewares: (RequestHandler<T> | ErrorRequestHandler<T>)[] = [];

  public use(requestHandler: RequestHandler<T> | ErrorRequestHandler<T>) {
    this.middlewares.push(requestHandler);
  }

  public unuse(requestHandler: Handlers<T>) {
    this.middlewares = this.middlewares.filter(h => requestHandler !== h);
  }

  public clear() {
    this.middlewares = [];
  }

  public handler = handler<T>((req, res, next) => {
    return composeMiddleware(...this.middlewares)(req, res, next);
  });

  public errorHandler = errorHandler<T>((req, res, next, error) => {
    return composeErrorMiddleware(...this.middlewares)(req, res, next, error);
  });
}

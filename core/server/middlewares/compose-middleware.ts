import { RequestHandler, ErrorRequestHandler, Params, ParamsDictionary } from 'express';
import { compose, errors } from 'compose-middleware';

export type ComposedRequestHandler<T> = T extends Handlers<infer R>[] ? RequestHandler<R> : never;

export type ComposedErrorRequestHandler<T> = T extends Handlers<infer R>[] ? ErrorRequestHandler<R> : never;

export type Handlers<T extends Params = ParamsDictionary> =
  | RequestHandler<T>
  | RequestHandler<T>[]
  | ErrorRequestHandler<T>
  | ErrorRequestHandler<T>[]
  | false
  | null
  | undefined;

/**
 * Return `middlewares` as a single, composed middleware function. You can give
 * the return value directly to `app.use(...)`.
 */
export function composeMiddleware<T extends Handlers<any>[] = Handlers[]>(
  ...middlewares: T
): ComposedRequestHandler<T> {
  return compose(middlewares.flat(Infinity).filter(Boolean) as any) as unknown as ComposedRequestHandler<T>;
}

/**
 * Return `middlewares` as a single, composed middleware function. You can give
 * the return value directly to `app.use(...)`. Unlike `composeMiddleware`, this
 * function returns a function in the format of an error middleware (with four
 * arguments instead of three).
 */
export function composeErrorMiddleware<T extends Handlers<any>[] = Handlers[]>(
  ...middlewares: T
): ComposedErrorRequestHandler<T> {
  return errors(middlewares.flat(Infinity).filter(Boolean) as any) as unknown as ComposedErrorRequestHandler<T>;
}

import { Params, ParamsDictionary, RequestHandler } from 'express';
import { merge } from '~/app/libs/lodash-utils';
import { handler } from './handler-factory';

interface Context<T extends Record<string, any>> {
  /**
   * Gets a copy of the current context data saved in the request.
   */
  get(): Partial<T>;

  /**
   * Sets the context data saved in the request.
   */
  set(values: Partial<T>): void;

  /**
   * Recursively merges `values` with context data currently saved in the
   * request.
   */
  merge(values: Partial<T>): void;
}

/**
 * Saves arbitrary context data in the current request. This data is able to be
 * shared and changed throughout the lifecycle of the request in a
 * strongly-typed manner.
 */
export function withContext<T extends Record<string, any>>(initialContext: Partial<T> = {}) {
  const context = Symbol('context');
  const contextState = Symbol('context state');

  return <TParams extends Params = ParamsDictionary>(
    handlerFactory: (context: Context<T>) => RequestHandler<TParams>,
  ): RequestHandler<TParams> => {
    return handler((req, res, next) => {
      if (!req[contextState]) {
        req[contextState] = { ...initialContext };
      }

      if (!req[context]) {
        req[context] = {
          get() {
            return { ...req[contextState] };
          },

          set(values) {
            req[contextState] = { ...values };
          },

          merge(values) {
            req[contextState] = merge({}, req[contextState], values);
          },
        } as Context<T>;
      }

      return handler(handlerFactory(req[context]))(req, res, next);
    });
  };
}

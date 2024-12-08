import type { JsonRpcRequestPayload } from 'magic-sdk';
import type { store } from '../store';

export type GetContext<T extends RpcMiddleware<any, any>> = T extends RpcMiddleware<infer A, infer B>
  ? RpcMiddlewareContext<A, B>
  : never;

export type RpcMiddlewareContext<TParams = any, TExt extends { [key: string]: any } | void = void> = {
  payload: JsonRpcRequestPayload<TParams>;
  getState: typeof store.getState;
  dispatch: typeof store.dispatch;
  render?: React.FC<any>;
} & {
  [P in keyof TExt]: TExt[P];
};

/**
 * As with traditional HTTP server applications, we can build chunks of behavior
 * into `RpcMiddleware` functions.
 *
 * These work very similarly to Express middlewares, just call `next()` to move
 * along the middlware stack.
 */
export interface RpcMiddleware<TParams = any, TExt extends { [key: string]: any } | void = void> {
  (context: RpcMiddlewareContext<TParams, TExt>, next: () => void): void | Promise<void>;
}

export type GetContextExtensionsFromMiddlewares<T extends RpcMiddleware<any, any>[]> = T extends RpcMiddleware<
  any,
  infer P
>[]
  ? { [K in keyof P]: P[K] }
  : never;

/**
 * Represents the executor for a stack of `RpcMiddleware` functions.
 */
export interface RpcController<TMiddlewares extends RpcMiddleware<any, any>[] = any> {
  (payload: JsonRpcRequestPayload, context: GetContextExtensionsFromMiddlewares<TMiddlewares>): Promise<void>;
}

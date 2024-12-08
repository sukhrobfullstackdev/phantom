import type { JsonRpcRequestPayload } from 'magic-sdk';
import type { RpcMiddleware, RpcController, GetContextExtensionsFromMiddlewares } from '../types';
import { ensureArray } from '~/shared/libs/array-helpers';
import { getController, getPayloadData, getPayloadEventEmitter, PayloadEvents } from './index';
import { jsonRpcConcurrencyLock } from '~/app/libs/semaphore';
import { store } from '~/app/store';

export type RpcRouteConfig<T extends RpcMiddleware<any, any>[] = any> = {
  render?: React.FC<any> | undefined;
  middlewares?: T;
  uiEvents?: Partial<Record<PayloadEvents, RpcMiddleware[]>>;
  initialContextFactory?: () => any;
};

export class RpcRoute<T extends RpcMiddleware<any, any>[] = any> {
  private uiEvents: Partial<Record<PayloadEvents, RpcController>> = {};
  private initialContextFactory: () => GetContextExtensionsFromMiddlewares<T>;
  private _render: React.FC<any> | undefined;
  public middlewares: T;

  constructor(...middlewares: T) {
    this.middlewares = middlewares;
    this.initialContextFactory = () => ({} as any);
  }

  /**
   * Registers a UI event handler. This composes the given `middlewares` as a
   * `RpcController` that can be invoked with the `useEmitUIThreadEvent` UI
   * hook.
   */
  public uiEvent<TUIEvent extends RpcMiddleware<any, any>[]>(eventName: PayloadEvents, ...middlewares: TUIEvent) {
    this.uiEvents[eventName] = getController(middlewares);
    return this;
  }

  /**
   * Registers a React component to render upon showing
   * UI related to this RPC route.
   */
  public render<T extends React.FC<any>>(renderFn: T) {
    this._render = renderFn;
    return this;
  }

  /**
   * Registers a factory function which builds the initial context object given
   * to the route controller.
   */
  public provideInitialContext(factory: () => GetContextExtensionsFromMiddlewares<T>) {
    this.initialContextFactory = factory;
    return this;
  }

  /**
   * Execute this route's controller logic for the given `payload`.
   */
  public async handler(payload: JsonRpcRequestPayload) {
    const payloadData = getPayloadData(payload);

    if (!payloadData.didAcquireConcurrencySemaphorePermit) {
      await jsonRpcConcurrencyLock.acquire();

      await store.syncPersistor();

      getPayloadEventEmitter(payload).once('done', () => {
        jsonRpcConcurrencyLock.signal();
      });

      payloadData.didAcquireConcurrencySemaphorePermit = true;
    }

    const controller = getController(this.middlewares, this.uiEvents, this._render);
    await controller(payload, this.initialContextFactory());
  }

  public loadConfig(config: RpcRouteConfig<T> = {}) {
    this._render = config.render ?? this._render;
    this.middlewares = config.middlewares ?? this.middlewares;
    this.initialContextFactory = config.initialContextFactory ?? this.initialContextFactory;

    Object.keys(config.uiEvents || {}).forEach(key => {
      this.uiEvent(key as PayloadEvents, config.uiEvents?.[key]);
    });

    return this;
  }
}

export class RpcRouter {
  private globalMiddlewares: RpcMiddleware<any, any>[] = [];
  public routes: Record<string, RpcRoute>;

  constructor(initialRoutes: Record<string, RpcRoute> = {}) {
    this.routes = { ...initialRoutes };
  }

  /**
   * Registers a `RpcRoute` object for the given `methods`.
   */
  public use<T extends RpcMiddleware<any, any>[]>(methods: string | string[], ...middlewares: T): RpcRoute<T>;
  public use<T extends RpcMiddleware<any, any>[]>(...middlewares: T): void;
  public use<T extends RpcMiddleware<any, any>[]>(
    methodsOrMiddleware: string | string[] | RpcMiddleware<any, any>,
    ...middlewares: T
  ): RpcRoute<T> | void {
    if (typeof methodsOrMiddleware === 'function') {
      this.globalMiddlewares.push(methodsOrMiddleware, ...middlewares);
    } else {
      const r = new RpcRoute(...this.globalMiddlewares, ...middlewares);

      ensureArray(methodsOrMiddleware).forEach(method => {
        this.routes[method] = r;
      });

      return r as unknown as RpcRoute<T>;
    }
  }
}

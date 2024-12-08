import { isNil } from '~/app/libs/lodash-utils';

import { JsonRpcRequestPayload } from 'magic-sdk';
import EventEmitter from 'eventemitter3';
import { store } from '../../store';
import { SDKError, sdkErrorFactories } from '../../libs/exceptions';
import { JsonRpcService } from '../../services/json-rpc';
import { RpcMiddleware, RpcController } from '../types';
import { ensureArray } from '~/shared/libs/array-helpers';
import { sequentialPromise } from '~/shared/libs/sequential-promise';
import { RpcRouter } from './rpc-router';
import { jsonRpcConcurrencyLock } from '~/app/libs/semaphore';

import { SystemThunks } from '../../store/system/system.thunks';
import { AuthThunks } from '../../store/auth/auth.thunks';
import { UIThreadThunks } from '../../store/ui-thread/ui-thread.thunks';

/**
 * Hydrates the cached user, resolving `true` if a user can be hydrated, `false`
 * otherwise.
 */
export async function handleHydrateUser(...args: Parameters<typeof AuthThunks.hydrateActiveUser>): Promise<boolean> {
  return store.dispatch(AuthThunks.hydrateActiveUser(...args));
}

/**
 * Hydrates the cached user, resolving if a user can be hydrated, rejecting
 * otherwise.
 */
export async function handleHydrateUserOrReject(...args: Parameters<typeof AuthThunks.hydrateActiveUser>) {
  const hydrated = await store.dispatch(AuthThunks.hydrateActiveUser(...args));
  if (!hydrated) throw sdkErrorFactories.client.userDeniedAccountAccess();
}

/**
 * Resolve the given `payload` successfully with the given `result`,
 * automatically detecting whether it's in the UI thread.
 */
export async function resolvePayload<T = any>(payload: JsonRpcRequestPayload, result: T) {
  const state = store.getState();

  if (state.System.showUI && payload.id === state.UIThread.payload?.id) {
    await store.dispatch(UIThreadThunks.releaseLockAndHideUI({ result }));
  } else {
    await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result }));
  }
}

/**
 * Reject the given `payload` with the given `error`,
 * automatically detecting whether it's in the UI thread.
 */
export async function rejectPayload<T = any>(payload: JsonRpcRequestPayload, error: SDKError) {
  const state = store.getState();

  if (state.System.showUI && payload.id === state.UIThread.payload?.id) {
    await store.dispatch(UIThreadThunks.releaseLockAndHideUI({ error }));
  } else {
    await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, error }));
  }
}

/**
 * Pass the given payload through to the Ethereum Node as is.
 */
export async function ethereumProxyPassthrough(payload: JsonRpcRequestPayload) {
  if (payload.method.startsWith('testMode/eth/')) {
    payload.method = payload.method.replace('testMode/eth/', '');
  }

  await jsonRpcConcurrencyLock.acquire();

  getPayloadEventEmitter(payload).once('done', () => {
    jsonRpcConcurrencyLock.signal();
  });

  const result = await JsonRpcService.ethereumProxy(payload);
  await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result }));
}

/**
 * Gets the first defined route handler from the provided `RpcRouter` list.
 */
export function getHandler(payload: JsonRpcRequestPayload, routers: RpcRouter | RpcRouter[]) {
  const route = ensureArray(routers)
    .map(router => router.routes[payload.method])
    .find(matchedRoute => !isNil(matchedRoute));

  return route?.handler.bind(route);
}

/**
 * Composes a controller from the given `middlewares`. This helps us add another
 * layer of abstraction to RPC method handling, enabling more complex use-cases
 * and better separation of concerns.
 */
export function getController<TMiddlewares extends RpcMiddleware<any, any>[]>(
  middlewares: TMiddlewares,
  events: Partial<Record<PayloadEvents, RpcController>> = {},
  render?: React.FC<any>,
): RpcController<TMiddlewares> {
  return (payload, context) => {
    const ctx = { payload, getState: store.getState, dispatch: store.dispatch, render, ...context };

    const boundEvents = Object.fromEntries(
      Object.entries(events).map(([eventName, controller]) => [eventName, controller.bind(controller, payload, ctx)]),
    );

    const eventEmitter = getPayloadEventEmitter(payload);

    for (const [eventName, controller] of Object.entries(boundEvents)) {
      eventEmitter.on(eventName as PayloadEvents, controller);
    }

    return sequentialPromise(
      middlewares.map(m => () => {
        return new Promise<void>((resolve, reject) => {
          const next = () => resolve();
          Promise.resolve(m.apply(m, [ctx, next])).catch(reject);
        });
      }),
    );
  };
}

export type PayloadEvents = 'done' | 'retry';
export type PayloadEventEmitter = EventEmitter<Record<PayloadEvents, () => {}>>;

const eventEmitterSymbol = Symbol('eventsSymbol');

/**
 * Executes all acknowledgement callbacks that are registered to a JSON RPC
 * payload.
 */
export function getPayloadEventEmitter(payload: JsonRpcRequestPayload): PayloadEventEmitter {
  if (!payload[eventEmitterSymbol]) payload[eventEmitterSymbol] = new EventEmitter();
  return payload[eventEmitterSymbol];
}

interface PayloadData {
  /**
   * If `true`, then Semaphore permits for the flow associated to this payload
   * were already acquired, so if the payload is re-emitted or redirected to the
   * top of the RPC processing stack, Semaphore permits won't be acquired again,
   * unnecessarily.
   */
  didAcquireConcurrencySemaphorePermit: boolean;

  /**
   * Same as Semaphore permits except this if for atomic routes.
   * We don't want to try and get Semaphore again.
   */
  didAcquireAtomicSemaphorePermit: boolean;

  /**
   * An optional refresh token to be used for the request.
   */
  rt?: string;

  /**
   * A DPoP proof jwt that is required to use the optional refresh token
   * and as such is also optional.
   */
  jwt?: string;

  /**
   * For split key dkms, the device share is the Client Plaintext Share
   * encrypted with the Magic KMS, stored only on the user's device
   * If present, this saves a call to the Client KMS
   */
  deviceShare?: string;
}

const payloadDataSymbol = Symbol('payloadDataSymbol');

/**
 * Retrieves contextual data saved to the JSON RPC payload object itself. This
 * can be used to store payload-specific state without a reliance on the
 * Redux-layer of the app (this should reduce complexity in certain scenarios).
 */
export function getPayloadData(payload: JsonRpcRequestPayload): Partial<PayloadData> {
  if (!payload[payloadDataSymbol]) payload[payloadDataSymbol] = {};
  return payload[payloadDataSymbol];
}

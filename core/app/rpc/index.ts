import { JsonRpcBatchRequestPayload } from 'fortmatic';
import { cloneDeep, isEmpty } from '~/app/libs/lodash-utils';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { FeatureName } from '~/features/manifest';
import { cleanArray } from '~/shared/libs/array-helpers';
import { manifest } from '../constants/feature-manifest';
import { handleError, sdkErrorFactories } from '../libs/exceptions';
import { loadFeature } from '../libs/load-feature';
import { isETHWalletType } from '../libs/network';
import { isJsonRpcBatchRequestPayload, isJsonRpcRequestPayload } from '../types/type-guards';
import { ethereumProxyPassthrough, getHandler } from './utils';
import { RpcRoute, RpcRouter } from './utils/rpc-router';
import { validatePayload } from './utils/validate-payload';

// JSON RPC routers
import { ethMethodRoutes } from './routes/eth-method-routes';
import { createLedgerMethodRoutes } from './routes/ledger-method-routes';
import { magicMethodRoutes } from './routes/magic-method-routes';
import { store } from '../store';
import { setActivePayload } from '../store/active-payload/active-payload.actions';
import { MAGIC_AUTH_UPDATE_EMAIL, MAGIC_AUTH_UPDATE_EMAIL_V2 } from '~/app/constants/route-methods';
import { SystemThunks } from '../store/system/system.thunks';
import { globalCache } from '~/shared/libs/cache';
import { setUserKeys } from '../store/auth/auth.actions';

/*

  Due to the way we've implemented JSON RPC in the past, batch requests are
  handled a little off-spec. JSON RPC 2.0 says that batch requests should be an
  array of RPC payloads, but Fortmatic X consumes batch payloads with the
  following shape:

    {
      "jsonrpc": "2.0",
      "id": "some random ID",
      "method": "eth_batchRequest",
      "batch": [...payloads]
    }

  For this implementation, we handle both the off-spec object format and the
  proper JSON RPC 2.0 spec format.

  When Fortmatic Phantom is deprecated in favor of Magic SDK, we will remove
  this legacy compatiblity.

 */

/**
 * Execute a payload handler, with generic fallbacks if the handler is
 * `undefined`.
 */
async function executeHandler(
  payload: JsonRpcRequestPayload,
  requestType: 'single' | 'batch',
  handler?: RpcRoute['handler'],
) {
  try {
    if (handler) {
      await handler(payload);

      // Currently, only Ethereum methods are handled in batch requests, so we
      // allow the `ethereumProxyPassthrough` even if the wallet type is not
      // "ETH".
    } else if (isETHWalletType() || requestType === 'batch') {
      await ethereumProxyPassthrough(payload);
    } else {
      await sdkErrorFactories.rpc.methodNotFoundError(`\`${payload?.method}\``).sdkReject(payload);
    }
  } catch (e) {
    await handleError(payload, e);
  }
}

/**
 * Routes an incoming JSON RPC payload to the appropriate processing logic.
 */
export async function routeJsonRpcMethod(
  payload?: JsonRpcRequestPayload | JsonRpcRequestPayload[] | JsonRpcBatchRequestPayload,
) {
  if ((payload as JsonRpcRequestPayload)?.method === 'clear_keys_and_cache') {
    store.dispatch(setUserKeys({ authUserId: '' }));
    globalCache.clear();
    await store.dispatch(
      SystemThunks.resolveJsonRpcResponse({ payload: payload as JsonRpcRequestPayload, result: true }),
    );
    return;
  }
  if (Array.isArray(payload)) return routeJsonRpcBatch(payload);

  // Method mapping for Feature Framework
  if (payload && MagicFeatureFrameworkRerouteMapping[payload?.method]) {
    payload.method = MagicFeatureFrameworkRerouteMapping[payload?.method];
  }

  // add the active payload in redux, used for logging
  store.dispatch(setActivePayload(payload));

  const payloadClone = cloneDeep(payload);

  if (await validatePayload(payloadClone)) {
    if (isJsonRpcRequestPayload(payloadClone)) {
      const ledgerMethodHandlers = isETHWalletType() ? ethMethodRoutes : await createLedgerMethodRoutes();

      const featureName = Object.keys(manifest.features).find(name => {
        return Object.keys(manifest.features[name].rpc as {}).includes(payloadClone.method);
      }) as FeatureName | undefined;
      let featureRouter: RpcRouter | undefined;

      try {
        featureRouter = featureName
          ? new RpcRouter({
              [payloadClone.method]: new RpcRoute().loadConfig(
                (await loadFeature(featureName, 'RPC', manifest.features[featureName].rpc[payloadClone.method]))
                  .default,
              ),
            })
          : undefined;
      } catch (e) {
        // If we encounter a problem dynamically loading feature dependencies
        // for the requested payload, we raise an internal error so the
        // developer can try again. Most of the time, the reason for an error
        // here is network latency.
        const errorMessage = (e as any).message as string;
        await sdkErrorFactories.rpc.internalError(errorMessage).sdkReject(payload);
        return;
      }

      const handler = getHandler(payloadClone, cleanArray([magicMethodRoutes, ledgerMethodHandlers, featureRouter]));

      await executeHandler(payloadClone, 'single', handler);
    } else if (isJsonRpcBatchRequestPayload(payloadClone)) {
      await routeJsonRpcBatch(payloadClone);
    }
  }
}

/**
 * Propogate batch requests through the payload handler stack.
 */
export async function routeJsonRpcBatch(batchPayload: JsonRpcBatchRequestPayload | JsonRpcRequestPayload[]) {
  const payloads = isArray(batchPayload) ? cloneDeep(batchPayload) : batchPayload.batch.map(cloneDeep);

  if (!isEmpty(payloads)) {
    const batchTasks = payloads.map(payload => {
      // Currently, only Ethereum methods are handled in batch requests.
      const handler = getHandler(payload, [ethMethodRoutes]);

      return async () => {
        if (await validatePayload(payload)) {
          await executeHandler(payload, 'batch', handler);
        }
      };
    });

    batchTasks.map(async task => {
      await task();
    });
  } else {
    await sdkErrorFactories.client.missingPayloadBatch().sdkReject(payloads);
  }
}

const MagicFeatureFrameworkRerouteMapping = {
  [MAGIC_AUTH_UPDATE_EMAIL]: MAGIC_AUTH_UPDATE_EMAIL_V2,
};

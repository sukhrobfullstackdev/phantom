import { routeJsonRpcMethod } from '~/app/rpc';
import { RpcMiddleware } from '~/app/rpc/types';

export const forwardEthMethodToCoreRpcHandler: RpcMiddleware = async ({ payload }) => {
  if (payload.method.startsWith('testMode/eth/')) {
    payload.method = payload.method.replace('testMode/eth/', '');
  }

  await routeJsonRpcMethod(payload);
};

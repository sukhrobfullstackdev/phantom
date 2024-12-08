import { isEmpty } from '~/app/libs/lodash-utils';
import { DEFAULT_TOKEN_LIFESPAN } from '~/app/rpc/routes/magic-method-routes';
import { resolvePayload } from '~/app/rpc/utils';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { createFeatureModule } from '~/features/framework';
import { testModeStore } from '~/features/test-mode/store';
import { createTestDIDToken } from '~/features/test-mode/utils/test-did-token';

const magicAuthGetIdTokenTestMiddleware = async ({ payload }) => {
  let ls = DEFAULT_TOKEN_LIFESPAN;
  if (!isEmpty(payload.params[0])) {
    const [{ lifespan }] = payload.params as [{ lifespan: number }];
    if (lifespan) ls = lifespan;
  }

  const { publicAddress, privateAddress } = testModeStore.getState();

  const token = await createTestDIDToken({
    userKeys: { publicAddress, privateAddress },
    lifespan: ls,
  });

  await resolvePayload(payload, token);
};

export default createFeatureModule.RPC({
  middlewares: [magicAuthGetIdTokenTestMiddleware],
} as RpcRouteConfig);

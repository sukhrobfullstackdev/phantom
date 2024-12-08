import { isEmpty } from '~/app/libs/lodash-utils';
import { resolvePayload } from '~/app/rpc/utils';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { createFeatureModule } from '~/features/framework';
import { testModeStore } from '~/features/test-mode/store';

import { DEFAULT_TOKEN_LIFESPAN } from '~/app/rpc/routes/magic-method-routes';
import { createTestDIDToken } from '~/features/test-mode/utils/test-did-token';

const magicAuthGetGenerateIdTokenTestMiddleware = async ({ payload }) => {
  let att: string | undefined;
  let ls = DEFAULT_TOKEN_LIFESPAN;
  if (!isEmpty(payload.params[0])) {
    const [{ attachment, lifespan }] = payload.params as [{ attachment: string | undefined; lifespan: number }];
    if (attachment) att = attachment;
    if (lifespan) ls = lifespan;
  }

  const { publicAddress, privateAddress } = testModeStore.getState();

  const token = await createTestDIDToken({
    userKeys: { publicAddress, privateAddress },
    lifespan: ls,
    attachment: att,
  });

  await resolvePayload(payload, token);
};

export default createFeatureModule.RPC({
  middlewares: [magicAuthGetGenerateIdTokenTestMiddleware],
} as RpcRouteConfig);

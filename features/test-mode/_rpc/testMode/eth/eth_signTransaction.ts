import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { web3SignTransactionForTestUser } from '~/features/test-mode/utils/test-web3-transaction';

const ethSignTransactionTestMiddleware = async ({ payload }) => {
  const result = await web3SignTransactionForTestUser(payload);
  await resolvePayload(payload, result);
};

export default createFeatureModule.RPC({ middlewares: [ethSignTransactionTestMiddleware] });

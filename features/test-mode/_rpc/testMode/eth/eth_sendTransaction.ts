import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { web3SendTransactionForTestUser } from '~/features/test-mode/utils/test-web3-transaction';

const ethSendTransactionTestMiddleware = async ({ payload }) => {
  const result = await web3SendTransactionForTestUser(payload);
  await resolvePayload(payload, result);
};

export default createFeatureModule.RPC({
  middlewares: [ethSendTransactionTestMiddleware],
});

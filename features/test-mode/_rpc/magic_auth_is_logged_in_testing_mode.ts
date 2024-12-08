import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { testModeStore } from '~/features/test-mode/store';

const magicAuthIsLoggedInTestMiddleware = async ({ payload }) => {
  const { isLoggedIn } = testModeStore.getState();
  await resolvePayload(payload, !!isLoggedIn);
};

export default createFeatureModule.RPC({
  middlewares: [magicAuthIsLoggedInTestMiddleware],
});

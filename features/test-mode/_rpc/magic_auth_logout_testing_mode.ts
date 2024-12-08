import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { testModeStore } from '~/features/test-mode/store';
import * as testModeActions from '../store/test-mode.actions';

const magicAuthLogoutTestMiddleware = async ({ payload }) => {
  testModeStore.dispatch(testModeActions.testModeLogout());
  await resolvePayload(payload, true);
};

export default createFeatureModule.RPC({
  middlewares: [magicAuthLogoutTestMiddleware],
});

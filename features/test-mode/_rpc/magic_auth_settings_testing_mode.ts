import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { testModeStore } from '~/features/test-mode/store';
import { generateUserId } from '~/app/libs/generate-user-id';

const magicAuthSettingsTestMiddleware = async ({ payload }) => {
  const { publicAddress, userEmail: email } = testModeStore.getState();
  const issuer = publicAddress ? generateUserId(publicAddress) : null;

  const userMetadata = {
    issuer,
    publicAddress,
    email,
  };

  await resolvePayload(payload, userMetadata);
};

export default createFeatureModule.RPC({
  middlewares: [magicAuthSettingsTestMiddleware],
});

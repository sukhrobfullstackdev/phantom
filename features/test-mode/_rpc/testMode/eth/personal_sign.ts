import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { testModeStore } from '~/features/test-mode/store';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { compareAddresses } from '~/app/libs/web3-utils';
import { TestModeWeb3Signers } from '~/features/test-mode/utils/test-web3-signers';

const personalSignTestMiddleware = async ({ payload }) => {
  const [message, signerAddress] = payload.params as [string, string];
  if (!compareAddresses([signerAddress, testModeStore.getState().publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(payload);
  } else {
    const signature = await testModeStore.dispatch(TestModeWeb3Signers.personalSignForUser(message));
    await resolvePayload(payload, signature);
  }
};

export default createFeatureModule.RPC({
  middlewares: [showUI.force, personalSignTestMiddleware],
});

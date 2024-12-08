import { createFeatureModule } from '~/features/framework';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { compareAddresses } from '~/app/libs/web3-utils';
import { resolvePayload } from '~/app/rpc/utils';
import { testModeStore } from '../../../store';
import { TestModeWeb3Signers } from '../../../utils/test-web3-signers';

const ethSignTestMiddleware = async ({ payload }) => {
  const [signerAddress, message] = payload.params as [string, string];
  if (!compareAddresses([signerAddress, testModeStore.getState().publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(payload);
  } else {
    const signature = await testModeStore.dispatch(TestModeWeb3Signers.personalSignForUser(message));
    await resolvePayload(payload, signature);
  }
};

export default createFeatureModule.RPC({
  middlewares: [ethSignTestMiddleware],
});

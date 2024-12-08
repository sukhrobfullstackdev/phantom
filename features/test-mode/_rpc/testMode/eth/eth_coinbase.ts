import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { testModeStore } from '~/features/test-mode/store';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { toChecksumAddress } from '~/app/libs/web3-utils';

const ethCoinbaseTestMiddleware = async ({ payload }) => {
  const { publicAddress } = testModeStore.getState();
  if (publicAddress) resolvePayload(payload, toChecksumAddress(publicAddress));
  else await sdkErrorFactories.client.userDeniedAccountAccess().sdkReject(payload);
};

export default createFeatureModule.RPC({
  middlewares: [showUI.force, ethCoinbaseTestMiddleware],
});

import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { ThirdPartyWallet } from '../store/connect.reducer';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { handleThirdPartyWalletConnected } from '../utils/handle-third-party-wallet-connected';
import { connectStore } from '../store';
import { setThirdPartyWallet } from '../store/connect.actions';
import { toChecksumAddress } from '~/app/libs/web3-utils';

const autoConnectMiddleware = async ({ payload }) => {
  const walletType = payload.params[0].wallet.toLocaleUpperCase() as ThirdPartyWallet;
  const address = payload.params[0].address[0] as string;
  const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  if (!walletType || !address) {
    return rejectPayload(payload, sdkErrorFactories.rpc.invalidParamsError());
  }

  // Use chainId from network set by sdk
  let chainId;
  switch (ETH_NETWORK) {
    case 'mainnet':
      chainId = 1;
      break;
    case 'goerli':
      chainId = 5;
      break;
    case 'sepolia':
      chainId = 11155111;
      break;
    default:
      chainId =
        Number(
          (
            ETH_NETWORK as {
              rpcUrl: string;
              chainId?: number | undefined;
            }
          ).chainId,
        ) || 1;
      break;
  }

  connectStore.dispatch(setThirdPartyWallet(walletType));
  handleThirdPartyWalletConnected(address, chainId, walletType.toLocaleUpperCase() as ThirdPartyWallet);
  return resolvePayload(payload, [toChecksumAddress(address)]);
};

const mc_auto_connect: RpcRouteConfig = {
  middlewares: [atomic(), autoConnectMiddleware],
};

export default createFeatureModule.RPC(mc_auto_connect);

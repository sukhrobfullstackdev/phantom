import {
  ETH_SEND_GASLESS_TRANSACTION,
  ETH_SIGN,
  ETH_SIGNTYPEDDATA_V3,
  ETH_SIGNTYPEDDATA_V4,
} from '~/app/constants/eth-rpc-methods';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { compareAddresses } from '~/app/libs/web3-utils';
import { RpcMiddleware } from '~/app/rpc/types';
import { store } from '~/app/store';

export type blockchainUIMethodsParams = [];
export type blockchainUIMethodsContext = {};
export type blockchainUIMiddleware = RpcMiddleware<blockchainUIMethodsParams, blockchainUIMethodsContext>;

export const compareSignerUserAddress: blockchainUIMiddleware = async (ctx, next) => {
  // some signing rpc methods have inconsistent ordering of the
  // signer address in the params argument...so we before checking addresses.
  const zeroIndexSignerMethods = [ETH_SIGN, ETH_SIGNTYPEDDATA_V3, ETH_SIGNTYPEDDATA_V4, ETH_SEND_GASLESS_TRANSACTION];
  const isZeroIndexSignerMethod = zeroIndexSignerMethods.includes(
    ctx.payload.method.replace('mc_', '').replace('mwui_', ''),
  );

  const signerAddress = (ctx.payload.params as any)[isZeroIndexSignerMethod ? 0 : 1];

  if (!compareAddresses([signerAddress, store.getState().Auth.userKeys.publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(ctx.payload);
  } else {
    next();
  }
};

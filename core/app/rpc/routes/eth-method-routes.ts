import { cloneDeep, has, isString } from '~/app/libs/lodash-utils';
import { EIP712LegacyData, EIP712TypedData } from 'eth-sig-util';
import { Web3Service } from '../../services/web3';
import { sdkErrorFactories } from '../../libs/exceptions';
import { compareAddresses, standardizePayload, toChecksumAddress } from '../../libs/web3-utils';
import { globalCache } from '~/shared/libs/cache';
import { JsonRpcService } from '../../services/json-rpc';
import { RpcRouter } from '../utils/rpc-router';

// Actions & Thunks
import { SystemThunks } from '../../store/system/system.thunks';
import { UserThunks } from '../../store/user/user.thunks';
import { hydrateUserOrReject } from '../controllers/user.controller';
import { ethRerouteRPC } from '../controllers/feature-route.controller';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';
import {
  ETH_ACCOUNTS,
  ETH_COINBASE,
  ETH_GASPRICE,
  ETH_REQUESTACCOUNTS,
  ETH_SENDTRANSACTION,
  ETH_SEND_GASLESS_TRANSACTION,
  ETH_SIGN,
  ETH_SIGNTRANSACTION,
  ETH_SIGNTYPEDDATA,
  ETH_SIGNTYPEDDATA_V3,
  ETH_SIGNTYPEDDATA_V4,
  NET_VERSION,
  PERSONAL_ECRECOVER,
  PERSONAL_SIGN,
} from '~/app/constants/eth-rpc-methods';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { GasService } from '~/app/services/gas';
import { PopulatedTransaction } from 'ethers';

export const ethMethodRoutes = new RpcRouter();

ethMethodRoutes.use(ethRerouteRPC);

ethMethodRoutes.use(ETH_GASPRICE, async ({ payload, dispatch }) => {
  const gasPrice = await Web3Service.getGasPrice();
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: gasPrice }));
});

ethMethodRoutes.use(ETH_SENDTRANSACTION, hydrateUserOrReject, async ({ payload, dispatch }) => {
  trackAction(AnalyticsActionType.HeadlessSendTransactionCalled);
  const result = await dispatch(UserThunks.sendTransactionForUser(payload));
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result }));
});

ethMethodRoutes.use(ETH_ACCOUNTS, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  const address = await globalCache.get(ETH_ACCOUNTS, async () => {
    return getState().Auth.userKeys.publicAddress;
  });
  if (address) await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: [toChecksumAddress(address)] }));
  else await sdkErrorFactories.client.userDeniedAccountAccess().sdkReject(payload);
});

ethMethodRoutes.use(ETH_REQUESTACCOUNTS, hydrateUserOrReject, async ({ payload }) => {
  // this logic is rerouted to mwui_eth_requestAccounts. see ethRerouteRPC
  await sdkErrorFactories.magic.unsupportedSDKMethodForGlobalWalletApps().sdkReject(payload);
});

ethMethodRoutes.use(ETH_COINBASE, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  const address = await globalCache.get(ETH_COINBASE, async () => {
    return getState().Auth.userKeys.publicAddress;
  });
  if (address) await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: toChecksumAddress(address) }));
  else await sdkErrorFactories.client.userDeniedAccountAccess().sdkReject(payload);
});

ethMethodRoutes.use(NET_VERSION, async ({ payload, dispatch }) => {
  const network = await globalCache.get<number | null>(NET_VERSION, async () => {
    const result = await JsonRpcService.ethereumProxy(payload);
    return result ?? null;
  });
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: network }));
});

ethMethodRoutes.use(PERSONAL_SIGN, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  trackAction(AnalyticsActionType.HeadlessPersonalSignCalled);
  const [message, signerAddress] = payload.params as [string, string];
  if (!compareAddresses([signerAddress, getState().Auth.userKeys.publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(payload);
  } else {
    const signature = await dispatch(UserThunks.personalSignForUser(message));
    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: signature }));
  }
});

ethMethodRoutes.use(PERSONAL_ECRECOVER, async ({ payload, dispatch }) => {
  const [message, signature] = payload.params as [string, string];
  const signerAddress = Web3Service.recoverPersonalSignature(message, signature);
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: toChecksumAddress(signerAddress) }));
});

ethMethodRoutes.use(ETH_SIGN, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  const [signerAddress, message] = payload.params as [string, string];
  if (!compareAddresses([signerAddress, getState().Auth.userKeys.publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(payload);
  } else {
    const signature = await dispatch(UserThunks.personalSignForUser(message));
    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: signature }));
  }
});

ethMethodRoutes.use(ETH_SIGNTYPEDDATA, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  const [typedData, signerAddress] = payload.params as [EIP712LegacyData, string];
  if (!compareAddresses([signerAddress, getState().Auth.userKeys.publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(payload);
  } else {
    const signature = await dispatch(UserThunks.signTypedDataV1ForUser(typedData));
    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: signature }));
  }
});

ethMethodRoutes.use(ETH_SIGNTYPEDDATA_V3, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  trackAction(AnalyticsActionType.HeadlessSignTypedDataV3Called);
  const [signerAddress, message] = payload.params as [string, string | EIP712TypedData];
  const typedData = isString(message) ? JSON.parse(message) : message;
  if (!compareAddresses([signerAddress, getState().Auth.userKeys.publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(payload);
  } else {
    const signature = await dispatch(UserThunks.signTypedDataV3ForUser(typedData));
    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: signature }));
  }
});

ethMethodRoutes.use(ETH_SIGNTYPEDDATA_V4, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  trackAction(AnalyticsActionType.HeadlessSignTypedDataV4Called);
  const [signerAddress, message] = payload.params as [string, string | EIP712TypedData];
  const typedData = isString(message) ? JSON.parse(message) : message;
  if (!compareAddresses([signerAddress, getState().Auth.userKeys.publicAddress])) {
    await sdkErrorFactories.web3.userDeniedSigning().sdkReject(payload);
  } else {
    const signature = await dispatch(UserThunks.signTypedDataV4ForUser(typedData));
    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: signature }));
  }
});

ethMethodRoutes.use(ETH_SIGNTRANSACTION, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  const { Auth } = getState();

  const chainId = (await Web3Service.getChainId()) as any;

  const chainIdNumber = Number(chainId) || 1;

  const network = networksByChainId[chainIdNumber];

  let standardizedPayload;

  if (network?.transactionFormat && has(standardizePayload, network?.transactionFormat)) {
    standardizedPayload = await standardizePayload[network.transactionFormat](cloneDeep(payload), chainIdNumber, Auth);
  } else {
    standardizedPayload = await standardizePayload.Ethereum(cloneDeep(payload), chainIdNumber, Auth);
  }

  const signedTransaction = await dispatch(UserThunks.signTransactionForUser(standardizedPayload));

  const result = {
    raw: signedTransaction.rawTransaction,
    tx: {
      nonce: standardizedPayload.nonce,
      to: standardizedPayload.to,
      value: standardizedPayload.value,
      v: signedTransaction.v,
      r: signedTransaction.r,
      s: signedTransaction.s,
      hash: signedTransaction.transactionHash,
      ...(Number(standardizedPayload.type) === 2
        ? {
            gasmaxFeePerGas: standardizedPayload.maxFeePerGas,
            maxPriorityFeePerGas: standardizedPayload.maxFeePerGas,
          }
        : {
            gasPrice: standardizedPayload.gasPrice,
            gas: standardizedPayload.gas,
          }),
    },
  };

  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result }));
});

ethMethodRoutes.use(ETH_SEND_GASLESS_TRANSACTION, hydrateUserOrReject, async ({ payload, dispatch, getState }) => {
  trackAction(AnalyticsActionType.HeadlessSendGaslessTransactionCalled);

  const flags = getState().System.CLIENT_FEATURE_FLAGS;
  if (!flags?.is_gasless_transactions_enabled) {
    await sdkErrorFactories.web3.gaslessTransactionsNotEnabled().sdkReject(payload);
    return;
  }

  const [signerAddress, transaction] = payload.params as [string, PopulatedTransaction];

  // Check if parameters are valid
  if (typeof signerAddress !== 'string') {
    await sdkErrorFactories.web3.missingParameter('address').sdkReject(payload);
    return;
  }

  // build forward payload
  const typedDataV4Payload = await GasService.buildForwardPayload(signerAddress, transaction);

  if (!compareAddresses([signerAddress, getState().Auth.userKeys.publicAddress])) {
    await sdkErrorFactories.web3.notMatchLoggedInUser().sdkReject(payload);
    return;
  }

  const signature = await dispatch(UserThunks.signTypedDataV4ForUser(typedDataV4Payload));
  const magicClientId = getState().Auth.clientID;

  // submit gasless request
  const response = await GasService.submitGaslessRequest({
    address: signerAddress,
    payload: typedDataV4Payload,
    signedTransaction: signature,
    magicClientId,
  });

  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: response }));
});

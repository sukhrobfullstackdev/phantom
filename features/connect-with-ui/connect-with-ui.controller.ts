import { JsonRpcRequestPayload } from 'magic-sdk';
import { ethers } from 'ethers';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { toChecksumAddress } from '~/app/libs/web3-utils';
import { RpcMiddleware } from '~/app/rpc/types';
import { getPayloadData, handleHydrateUser, rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { store } from '~/app/store';
import { connectStore } from './store';
import { ThirdPartyWallet } from './store/connect.reducer';
import { getChainId } from '~/app/services/web3/eth-methods';
import { setThirdPartyWallet } from './store/connect.actions';
import {
  handleWCDisconnectEvent,
  getWalletConnectProvider,
  resetWalletConnectInitialization,
  isSignTypedData,
  getMetamaskNetworkConfigFromChainId,
  isRequestingSignature,
  getCoinbaseWalletProvider,
  injectMetamaskProviderInFirefox,
} from './utils/third-party-wallet-utils';
import { trackPage } from '~/app/libs/analytics';
import { eventData } from './utils/get-login-method';
import {
  ETH_ACCOUNTS,
  ETH_CHAINID,
  ETH_REQUESTACCOUNTS,
  PERSONAL_SIGN,
  WALLET_SWITCHETHEREUMCHAIN,
} from '~/app/constants/eth-rpc-methods';
import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { isETHWalletType } from '~/app/libs/network';
import { isSdkVersionGreaterThanOrEqualTo } from '~/app/libs/is-version-greater-than';
import { globalCache } from '~/shared/libs/cache';

export type connectParams = [];
export type connectContext = {};
export type connectMiddleware = RpcMiddleware<connectParams, connectContext>;

export const resolvePublicAddressIfLoggedIn: connectMiddleware = async (ctx, next) => {
  const didResolveAddress = await tryResolvePublicAddress(ctx.payload);
  if (didResolveAddress) return;
  next();
};

// todo change this fit more blockchain in multi-wallet project
const handleMultiChainResolvePublicAddress = (address: string) => {
  return isETHWalletType() ? [toChecksumAddress(address)] : address;
};

const hydrateSession = async (payload: JsonRpcRequestPayload) => {
  const { jwt, rt } = getPayloadData(payload);
  const hydrated = await handleHydrateUser({ jwt, rt });
  return hydrated && !!store.getState().Auth.ust;
};

export const tryResolvePublicAddress = async (payload?: any) => {
  const threadPayload = store.getState().UIThread.payload as JsonRpcRequestPayload;
  let address = await globalCache.get(ETH_ACCOUNTS, async () => {
    return store.getState().Auth.userKeys.publicAddress;
  });

  if (!address) {
    const wasHydrated = await hydrateSession(threadPayload ?? payload);
    if (!wasHydrated) {
      return false;
    }
  }

  address = store.getState().Auth.userKeys.publicAddress;

  if (!address) {
    return false;
  }

  await resolvePayload(threadPayload ?? payload, handleMultiChainResolvePublicAddress(address));
  return true;
};

export const redirectThirdPartyWallet: connectMiddleware = async (ctx, next) => {
  if (!isGlobalAppScope() || isSdkVersionGreaterThanOrEqualTo('17.0.0')) {
    next();
    return;
  }
  await connectStore.ready;
  const thirdPartyWalletType = connectStore.getState().activeThirdPartyWallet;
  if (thirdPartyWalletType) {
    trackPage(ctx.payload.method, eventData);
    await resolveThirdPartyWalletRPC(thirdPartyWalletType, ctx.payload);
  } else {
    next();
  }
};
export const trackPageMiddleware: connectMiddleware = (ctx, next) => {
  trackPage(ctx.payload.method, eventData);
  next();
};

/**
 * STEPS FOR THIRD PARTY WALLET CONNECTION
 *
 * 1. Get ethereum client
 * 2. Check if logged in
 * 3. If they are NOT connected, prompt user to connect
 * 4. If they reject the connection, clear `thirdPartyWallet` and throw error
 * 5. If they ARE connected, proceed to get chain IDs
 * 6. If chain ID's match, forward rpc request to third party wallet
 * 7. If user signs payload, resolvePayload
 * 8. If user rejects payload, rejectPayload
 *
 * (if wallet-connect)
 * 9. If chain ID's don't match, reject payload
 *
 * (if metamask or coinbase-wallet)
 * 10. If chain ID's don't match, prompt user to change network
 * 11. If the user's wallet doesn't have the network we want to change to, catch the error code and prompt user to add
 * 11. If chain add & chain switch switch is accepted, proceed with request
 * 12. If user signs payload, resolvePayload
 * 13. If user rejects signing payload, rejectPayload
 * 14. If chain add or switch is rejected, throw error
 */

let isListeningForWCDisconnectEvent = false;

/**
 * Will attempt to resolve the RPC request to the active 3p wallet provider given.
 * It will return undefined if the resolution failed and the public address if successful.
 * Note this can and will also resolve the RPC payload before returning the address.
 * @param walletProviderType
 * @param payload
 * @returns undefined or public address string
 */
export const resolveThirdPartyWalletRPC = async (
  walletProviderType: ThirdPartyWallet,
  payload: JsonRpcRequestPayload,
) => {
  if (
    walletProviderType !== 'METAMASK' &&
    walletProviderType !== 'WALLET_CONNECT' &&
    walletProviderType !== 'COINBASE_WALLET'
  ) {
    return;
  }
  let method = payload.method.replace('mc_', '').replace('mwui_', '');
  let publicAddress = '';
  let result: any;

  // 3p wallets require data stringified for signTypedData_v3 & _v4
  if (isSignTypedData(method) && typeof payload.params[1] !== 'string') {
    payload.params[1] = JSON.stringify(payload.params[1]);
  }

  /**
   * Metamask
   */
  if (walletProviderType === 'METAMASK') {
    if (navigator.userAgent.includes('Firefox')) {
      injectMetamaskProviderInFirefox();
      await connectStore.dispatch(setThirdPartyWallet(null));
    }

    // if no metamask, early exit
    if (typeof (window as any)?.ethereum === 'undefined') {
      await connectStore.dispatch(setThirdPartyWallet(null));
      await rejectPayload(payload, sdkErrorFactories.rpc.invalidRequestError('Metamask not detected.'));
      return;
    }
    try {
      let metamaskProvider;
      // if multiple wallet extensions exist, filter to metamask
      if ((window as any).ethereum.providers) {
        metamaskProvider = (window as any).ethereum.providers.find(provider => provider.isMetaMask);
      } else {
        metamaskProvider = (window as any).ethereum;
      }

      try {
        [publicAddress] = await metamaskProvider.request({ method: ETH_REQUESTACCOUNTS });
        if (navigator.userAgent.includes('Firefox')) await connectStore.dispatch(setThirdPartyWallet('METAMASK'));
      } catch (e) {
        // user rejected access
        await connectStore.dispatch(setThirdPartyWallet(null));
        await rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
        return;
      }

      if (isRequestingSignature(method)) {
        const magicChainId = await getChainId();
        const metamaskChainId = await metamaskProvider.request({ method: ETH_CHAINID, params: [] });

        // make sure correct chain
        if (magicChainId !== metamaskChainId) {
          try {
            await metamaskProvider.request({
              method: WALLET_SWITCHETHEREUMCHAIN,
              params: [{ chainId: magicChainId }],
            });
          } catch (switchError: any) {
            // add missing chain if 4902 error
            if (switchError.code === 4902) {
              await metamaskProvider.request({
                method: WALLET_SWITCHETHEREUMCHAIN,
                params: [getMetamaskNetworkConfigFromChainId(magicChainId)],
              });
            } else {
              throw new Error('User denied chain switch request');
            }
          }
        }
      }
      result = await metamaskProvider.request({ method, params: payload.params });
    } catch (e) {
      await rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
      return;
    }
  }

  /**
   * Coinbase
   */
  if (walletProviderType === 'COINBASE_WALLET') {
    const provider = await getCoinbaseWalletProvider();

    // Will clear TPW if user disconnected from wallet (prevents app from hanging)
    const isCoinbaseAppStillConnected = localStorage.getItem('-walletlink:https://www.walletlink.org:Addresses');
    if (!isCoinbaseAppStillConnected) {
      await connectStore.dispatch(setThirdPartyWallet(null));
    }

    try {
      [publicAddress] = await provider.request({ method: ETH_REQUESTACCOUNTS });
      await connectStore.dispatch(setThirdPartyWallet('COINBASE_WALLET'));
    } catch (e) {
      // user rejected access
      await connectStore.dispatch(setThirdPartyWallet(null));
      await rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
      return;
    }

    try {
      if (isRequestingSignature(method)) {
        const magicChainId = await getChainId();
        const coinbaseWalletChainId = await provider.request({ method: ETH_CHAINID, params: [] });

        // make sure correct chain
        if (magicChainId !== coinbaseWalletChainId) {
          try {
            await provider.request({ method: WALLET_SWITCHETHEREUMCHAIN, params: [{ chainId: magicChainId }] });
          } catch (switchError: any) {
            // add missing chain if 4902 error
            if (switchError.code === 4902) {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [getMetamaskNetworkConfigFromChainId(magicChainId)],
              });
            } else {
              throw new Error('User denied chain switch request');
            }
          }
        }
      }
      result = await provider.request({ method, params: payload.params });
    } catch (e) {
      await rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
      return;
    }
  }

  /**
   * Wallet Connect
   */
  if (walletProviderType === 'WALLET_CONNECT') {
    const provider = await getWalletConnectProvider();

    const isWalletConnectSet = window.localStorage.getItem('walletconnect');
    if (!isWalletConnectSet) {
      await resetWalletConnectInitialization();
    }

    if (!isListeningForWCDisconnectEvent) {
      isListeningForWCDisconnectEvent = true;
      provider.on('disconnect', handleWCDisconnectEvent);
    }

    // request user connection and address
    try {
      await provider.enable();
      [publicAddress] = await provider.request({ method: ETH_ACCOUNTS });
    } catch (e) {
      await connectStore.dispatch(setThirdPartyWallet(null));
      await rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
      return;
    }

    // Reset the thirdPartyWallet if cleared out by `resetWalletConnectInitialization` call
    if (!isWalletConnectSet) {
      await connectStore.dispatch(setThirdPartyWallet(walletProviderType));
    }

    try {
      if (isRequestingSignature(method)) {
        const magicChainId = await getChainId();
        let walletConnectChainId = await provider.request({ method: ETH_CHAINID, params: [] });
        // convert to hex if a number
        if (typeof walletConnectChainId === 'number') {
          walletConnectChainId = ethers.utils.hexlify(walletConnectChainId);
        }

        // early exit if chain mismatch
        if (magicChainId !== walletConnectChainId) {
          await rejectPayload(
            payload,
            sdkErrorFactories.rpc.invalidRequestError(
              `Connected wallet is on the wrong network. Expected chain ID: ${Number(
                magicChainId,
              )}, got chain ID: ${Number(walletConnectChainId)}.`,
            ),
          );
          return;
        }
      }
      // Wallet Connect does not accept eth_requestAccounts, will throw an error
      if (method === ETH_REQUESTACCOUNTS) {
        method = ETH_ACCOUNTS;
      }
      result = await provider.request({ method, params: payload.params });
    } catch (e) {
      await rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
      return;
    }
  }

  await resolvePayload(payload, result);

  if (method === PERSONAL_SIGN) {
    return result;
  }

  return publicAddress;
};

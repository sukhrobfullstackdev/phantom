import { createAction } from 'typesafe-actions';
import { ThirdPartyWalletsInterface } from '../pages/new-login-prompt-page';
import { WalletConnectionsInfo } from '../utils/get-wallet-connections';
import * as actionTypes from './connect.actionTypes';
import {
  ConnectLoginTypes,
  ThirdPartyWallet,
  ThirdPartyWalletEnv,
  ThirdPartyWalletLoginFlowStartResponse,
  ThirdPartyWalletRequestUserInfo,
} from './connect.reducer';

export const setThirdPartyWallet = createAction(
  actionTypes.SET_THIRD_PARTY_WALLET,
  (walletType?: ThirdPartyWallet) => walletType,
)();

export const setThirdPartyWalletLoginFlowStartResponse = createAction(
  actionTypes.SET_THIRD_PARTY_WALLET_LOGIN_FLOW_RESPONSE_DATA,
  (thirdPartyWalletLoginFlowStartRepsonse?: ThirdPartyWalletLoginFlowStartResponse) =>
    thirdPartyWalletLoginFlowStartRepsonse,
)();

export const setThirdPartyWalletRequestUserInfo = createAction(
  actionTypes.SET_THIRD_PARTY_WALLET_REQUEST_USER_INFO,
  (thirdPartyWalletRequestUserInfo?: ThirdPartyWalletRequestUserInfo) => thirdPartyWalletRequestUserInfo,
)();

export const setLastSelectedLogin = createAction(
  actionTypes.SET_LAST_SELECTED_LOGIN,
  (login?: ConnectLoginTypes) => login,
)();

export const setWalletConnectionsInfo = createAction(
  actionTypes.SET_WALLET_CONNECTIONS_INFO,
  (walletConnectionsInfo?: WalletConnectionsInfo) => walletConnectionsInfo,
)();

export const setEnabledThirdPartyWallets = createAction(
  actionTypes.SET_ENABLED_THIRD_PARTY_WALLETS,
  (enabledThirdPartyWallets?: ThirdPartyWalletsInterface[]) => enabledThirdPartyWallets,
)();

export const setSelectedThirdPartyWallet = createAction(
  actionTypes.SET_SELECTED_THIRD_PARTY_WALLET,
  (selectedThirdPartyWallet?: ThirdPartyWalletsInterface) => selectedThirdPartyWallet,
)();

export const setThirdPartyWalletEnv = createAction(
  actionTypes.SET_THIRD_PARTY_WALLET_ENV,
  (thirdPartyWalletEnv?: ThirdPartyWalletEnv) => thirdPartyWalletEnv,
)();

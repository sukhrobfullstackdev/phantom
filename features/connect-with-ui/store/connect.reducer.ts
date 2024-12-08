import { ActionType, createReducer } from 'typesafe-actions';
import { getApiKey } from '~/app/libs/api-key';
import { MD5 } from '~/app/libs/crypto';
import { createPersistReducer } from '~/app/store/persistence';
import { ThirdPartyWalletsInterface } from '../pages/new-login-prompt-page';
import { LoginWithWalletStartResponse } from '../services/third-party-wallet-login';
import { WalletConnectionsInfo } from '../utils/get-wallet-connections';

import * as ConnectActions from './connect.actions';

export type ThirdPartyWallet = 'METAMASK' | 'WALLET_CONNECT' | 'COINBASE_WALLET' | null;
export type ConnectLoginTypes = 'email-otp' | 'google';

export type ThirdPartyWalletLoginFlowStartResponse = LoginWithWalletStartResponse;

export type ThirdPartyWalletRequestUserInfo = {
  showPrimer?: boolean;
  email?: string;
};

export type ThirdPartyWalletEnv = {
  isCoinbaseWalletInstalled: boolean;
  isMetaMaskInstalled: boolean;
};

export type CollectibleDetailsRouteParams = {
  contractAddress: string;
  tokenId: string;
};

interface ConnectState {
  activeThirdPartyWallet?: ThirdPartyWallet;
  lastSelectedLogin?: ConnectLoginTypes;
  thirdPartyWalletLoginFlowStartResponse?: ThirdPartyWalletLoginFlowStartResponse;
  thirdPartyWalletRequestUserInfo?: ThirdPartyWalletRequestUserInfo;
  walletConnectionsInfo?: WalletConnectionsInfo;
  enabledThirdPartyWallets?: ThirdPartyWalletsInterface[];
  selectedThirdPartyWallet?: ThirdPartyWalletsInterface;
  thirdPartyWalletEnv?: ThirdPartyWalletEnv;
}

type ConnectActions = ActionType<typeof ConnectActions>;

const initialState: ConnectState = {};

const ConnectReducers = createReducer<ConnectState, ConnectActions>(initialState)
  .handleAction(ConnectActions.setThirdPartyWallet, (state, action) => ({
    ...state,
    activeThirdPartyWallet: action.payload,
  }))
  .handleAction(ConnectActions.setLastSelectedLogin, (state, action) => ({
    ...state,
    lastSelectedLogin: action.payload,
  }))
  .handleAction(ConnectActions.setThirdPartyWalletLoginFlowStartResponse, (state, action) => ({
    ...state,
    thirdPartyWalletLoginFlowStartResponse: action.payload,
  }))
  .handleAction(ConnectActions.setThirdPartyWalletRequestUserInfo, (state, action) => ({
    ...state,
    thirdPartyWalletRequestUserInfo: action.payload,
  }))
  .handleAction(ConnectActions.setWalletConnectionsInfo, (state, action) => ({
    ...state,
    walletConnectionsInfo: action.payload,
  }))
  .handleAction(ConnectActions.setEnabledThirdPartyWallets, (state, action) => ({
    ...state,
    enabledThirdPartyWallets: action.payload,
  }))
  .handleAction(ConnectActions.setSelectedThirdPartyWallet, (state, action) => ({
    ...state,
    selectedThirdPartyWallet: action.payload,
  }))
  .handleAction(ConnectActions.setThirdPartyWalletEnv, (state, action) => ({
    ...state,
    thirdPartyWalletEnv: action.payload,
  }));

const apiKey = getApiKey();
export const ConnectReducer = createPersistReducer(`magic_connect:${MD5.digest(apiKey)}`, ConnectReducers, {
  whitelist: [
    'activeThirdPartyWallet',
    'thirdPartyWalletRequestUserInfo',
    'thirdPartyWalletLoginFlowStartResponse',
    'lastSelectedLogin',
  ] as (keyof ConnectState)[],
});

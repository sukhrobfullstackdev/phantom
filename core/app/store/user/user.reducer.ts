import { ActionType, createReducer } from 'typesafe-actions';
import { getApiKey } from '~/app/libs/api-key';
import { MD5 } from '~/app/libs/crypto';
import { AuthWalletType, ConnectWalletType } from '~/features/connect-with-ui/utils/get-wallet-connections';
import { createPersistReducer } from '../persistence';
import * as UserActions from './user.actions';
import { SendTransactionErrorType } from '~/features/blockchain-ui-methods/pages/send-transaction/pages/send-transaction-error-page/send-transaction-error-page';

export type SendTransactionRouteParams = {
  to: string | number;
  from: string | number;
  value: string | number;
  data?: string | number;
  logo?: string | undefined;
  isSendFlowUsdc?: boolean;
  errorType?: SendTransactionErrorType;
};

export type SendFundsRouteParams = {
  symbol: string;
  decimals: number;
  contractAddress: string;
  balance: string;
  logo: string | undefined;
  isSendFlowUsdc?: boolean;
};

export type FiatOnRampErrorRouteParams = {
  errorCode: string | undefined;
};

export type PendingTransactionRouteParams = {
  to: string;
  from: string;
  fiatValue: string;
  tokenAmount: string;
  symbol: string;
  hash: string;
  logo: string | undefined;
};

export type RequestUserInfoRouteParams = {
  isResponseRequired: boolean;
};

export type OnramperRouteParams = {
  defaultPaymentMethod: 'applepay' | 'googlepay' | 'creditcard' | 'banktransfer';
};

export type UserLocationData = {
  country: string;
  country_code: string;
  is_usa: boolean;
  locality: string;
  subdivision: string;
};

interface UserState {
  sendTransactionRouteParams?: SendTransactionRouteParams;
  sendFundsRouteParams?: SendFundsRouteParams;
  fiatOnRampErrorRouteParams?: FiatOnRampErrorRouteParams;
  pendingTransactionRouteParams?: PendingTransactionRouteParams;
  requestUserInfoRouteParams?: RequestUserInfoRouteParams;
  onramperRouteParams?: OnramperRouteParams;
  quickConnectRouteParams?: AuthWalletType | ConnectWalletType;
  profilePictureUrl?: string;
  activeAuthWallet?: AuthWalletType;
  usedChainIds?: string[] | undefined[];
  userLocation?: UserLocationData;
  filterSpam?: boolean;
}

type UserActions = ActionType<typeof UserActions>;

const initialState: UserState = {
  usedChainIds: [],
  filterSpam: false,
};

const UserReducers = createReducer<UserState, UserActions>(initialState)
  .handleAction(UserActions.setSendTransactionRouteParams, (state, action) => ({
    ...state,
    sendTransactionRouteParams: action.payload,
  }))
  .handleAction(UserActions.putSendTransactionRouteParams, (state, action) => ({
    ...state,
    sendTransactionRouteParams: {
      ...state.sendTransactionRouteParams!,
      ...action.payload,
    },
  }))
  .handleAction(UserActions.setSendFundsRouteParams, (state, action) => ({
    ...state,
    sendFundsRouteParams: action.payload,
  }))
  .handleAction(UserActions.setFiatOnRampErrorRouteParams, (state, action) => ({
    ...state,
    fiatOnRampErrorRouteParams: action.payload,
  }))
  .handleAction(UserActions.setPendingTransactionRouteParams, (state, action) => ({
    ...state,
    pendingTransactionRouteParams: action.payload,
  }))
  .handleAction(UserActions.setRequestUserInfoRouteParams, (state, action) => ({
    ...state,
    requestUserInfoRouteParams: action.payload,
  }))
  .handleAction(UserActions.setOnramperRouteParams, (state, action) => ({
    ...state,
    onramperRouteParams: action.payload,
  }))
  .handleAction(UserActions.setWalletQuickConnectRouteParams, (state, action) => ({
    ...state,
    quickConnectRouteParams: action.payload,
  }))
  .handleAction(UserActions.setProfilePictureUrl, (state, action) => ({
    ...state,
    profilePictureUrl: action.payload,
  }))
  .handleAction(UserActions.setActiveAuthWallet, (state, action) => ({
    ...state,
    activeAuthWallet: action.payload,
  }))
  .handleAction(UserActions.setUsedChainIds, (state, action) => ({
    ...state,
    usedChainIds: action.payload,
  }))
  .handleAction(UserActions.setUserLocation, (state, action) => ({
    ...state,
    userLocation: action.payload,
  }))
  .handleAction(UserActions.setFilterSpam, (state, action) => ({
    ...state,
    filterSpam: action.payload,
  }));

const apiKey = getApiKey();
export const User = createPersistReducer(`user:${MD5.digest(apiKey)}`, UserReducers, {
  whitelist: ['profilePictureUrl', 'activeAuthWallet'] as (keyof UserState)[],
});

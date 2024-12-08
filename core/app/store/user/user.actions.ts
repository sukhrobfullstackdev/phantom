import { createAction } from 'typesafe-actions';
import { AuthWalletType, ConnectWalletType } from '~/features/connect-with-ui/utils/get-wallet-connections';
import * as actionTypes from './user.actionTypes';
import {
  FiatOnRampErrorRouteParams,
  OnramperRouteParams,
  PendingTransactionRouteParams,
  RequestUserInfoRouteParams,
  SendFundsRouteParams,
  SendTransactionRouteParams,
  UserLocationData,
} from './user.reducer';

export const setSendTransactionRouteParams = createAction(
  actionTypes.SET_SEND_TRANSACTION_ROUTE_PARAMS,
  (sendTransactionRouteParams?: SendTransactionRouteParams) => sendTransactionRouteParams,
)();

export const putSendTransactionRouteParams = createAction(
  actionTypes.PUT_SEND_TRANSACTION_ROUTE_PARAMS,
  (sendTransactionRouteParams: Partial<SendTransactionRouteParams>) => sendTransactionRouteParams,
)();

export const setSendFundsRouteParams = createAction(
  actionTypes.SET_SEND_FUNDS_ROUTE_PARAMS,
  (sendFundsRouteParams?: SendFundsRouteParams) => sendFundsRouteParams,
)();

export const setFiatOnRampErrorRouteParams = createAction(
  actionTypes.SET_FIAT_ON_RAMP_ERROR_ROUTE_PARAMS,
  (fiatOnRampErrorRouteParams?: FiatOnRampErrorRouteParams) => fiatOnRampErrorRouteParams,
)();

export const setPendingTransactionRouteParams = createAction(
  actionTypes.SET_PENDING_TRANSACTION_ROUTE_PARAMS,
  (pendingTransactionRouteParams?: PendingTransactionRouteParams) => pendingTransactionRouteParams,
)();

export const setRequestUserInfoRouteParams = createAction(
  actionTypes.SET_REQUEST_USER_INFO_ROUTE_PARAMS,
  (requestUserInfoRouteParams?: RequestUserInfoRouteParams) => requestUserInfoRouteParams,
)();

export const setOnramperRouteParams = createAction(
  actionTypes.SET_ONRAMPER_ROUTE_PARAMS,
  (onramperRouteParams?: OnramperRouteParams) => onramperRouteParams,
)();

export const setWalletQuickConnectRouteParams = createAction(
  actionTypes.SET_WALLET_QUICK_CONNECT_ROUTE_PARAMS,
  (quickConnectRouteParams?: AuthWalletType | ConnectWalletType) => quickConnectRouteParams,
)();

export const setProfilePictureUrl = createAction(
  actionTypes.SET_PROFILE_PICTURE_URL,
  (profilePictureUrl?: string) => profilePictureUrl,
)();

export const setActiveAuthWallet = createAction(
  actionTypes.SET_AUTH_WALLET,
  (activeAuthWallet?: AuthWalletType) => activeAuthWallet,
)();

export const setUsedChainIds = createAction(
  actionTypes.SET_USED_CHAIN_IDS,
  (usedChainIds: string[] | undefined[]) => usedChainIds,
)();

export const setUserLocation = createAction(
  actionTypes.SET_USER_LOCATION,
  (userLocation: UserLocationData) => userLocation,
)();

export const setFilterSpam = createAction(actionTypes.SET_FILTER_SPAM, (filterSpam: boolean) => filterSpam)();

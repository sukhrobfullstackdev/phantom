import { ActionType, createReducer } from 'typesafe-actions';
import { DelegatedWalletInfo } from '../../types/delegated-wallet-types';
import * as authActions from './auth.actions';
import { createPersistReducer } from '../persistence';
import { MD5 } from '../../libs/crypto';
import { getApiKey } from '~/app/libs/api-key';
import { LoginMethodType } from '~/app/constants/flags';
import { MfaFactors } from '~/app/services/authentication/mfa-types';
import { UserConsentTypes } from '~/app/services/authentication/get-user-info';
import { OpenIDConnectUserInfo } from '~/features/oauth/types/open-id-connect';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { OAuthVerifyParams } from '~/features/oauth/controllers/client/verify';

export enum MagicLinkLoginType {
  Redirect = 'REDIRECT',
  OriginalContext = 'ORIGINAL_CONTEXT',
}

export interface OauthMfaContext {
  provider: string;
  userHandle: string;
  userInfo: OpenIDConnectUserInfo<'camelCase'>;
  scope: string[];
  payload: JsonRpcRequestPayload<OAuthVerifyParams>;
}

export interface UserKeys {
  authUserId: string;
  walletId?: string;
  publicAddress?: string;
  walletType?: string;
  encryptedPrivateAddress?: string;
  encryptedMagicPrivateAddressShare?: string;
  encryptedClientPrivateAddressShare?: string;
  encryptedClientPrivateAddressShareMetadata?: object;
  encryptedSeedPhrase?: string;
  encryptedMagicSeedPhraseShare?: string;
  encryptedClientSeedPhraseShare?: string;
  encryptedClientSeedPhraseShareMetadata?: object;
  deviceShare?: string; // NOTE: This is the device share of the network relayer is pointed to. Not always ETH.
}

export interface AuthState {
  userID: string;
  clientID: string;
  userEmail: string;
  userPhoneNumber: string;
  userMfaActive: boolean;
  loginFlowContext?: string;
  factorsRequired: MfaFactors;
  ust: string;
  rt?: string;
  jwt?: string | null;
  delegatedWalletInfo?: DelegatedWalletInfo;
  loginType?: LoginMethodType;
  userKeys: UserKeys;
  userConsent?: UserConsentTypes;
  isNewUser?: boolean | undefined;
  chainId?: string;
  securityOtp?: string;
  isDeviceRecognized?: boolean | undefined;
  deviceVerifyLink: string;
  magicLinkLoginType: MagicLinkLoginType;
  customAuthorizationToken?: string;
  deviceShare?: string;
  oauthMfaContext: OauthMfaContext | null;
}

export type ChainId = string;

type AuthActions = ActionType<typeof authActions>;

const initialState: AuthState = {
  userID: '',
  clientID: '',
  userEmail: '',
  userPhoneNumber: '',
  userMfaActive: false,
  loginFlowContext: undefined,
  factorsRequired: [],
  ust: '',
  delegatedWalletInfo: undefined,
  loginType: undefined,
  userKeys: { authUserId: '' },
  magicLinkLoginType: MagicLinkLoginType.OriginalContext,
  customAuthorizationToken: undefined,
  isDeviceRecognized: undefined,
  deviceVerifyLink: '',
  deviceShare: undefined,
  oauthMfaContext: null,
};

const AuthReducer = createReducer<AuthState, AuthActions>(initialState)
  .handleAction(authActions.setUserID, (state, action) => {
    if (action.payload) {
      return { ...state, userID: action.payload };
    }

    return { ...state, userID: initialState.userID };
  })
  .handleAction(authActions.setClientID, (state, action) => ({
    ...state,
    clientID: action.payload ?? initialState.clientID,
  }))
  .handleAction(authActions.setUserEmail, (state, action) => ({
    ...state,
    userEmail: action.payload ?? initialState.userEmail,
  }))
  .handleAction(authActions.setUserPhoneNumber, (state, action) => ({
    ...state,
    userPhoneNumber: action.payload ?? initialState.userPhoneNumber,
  }))
  .handleAction(authActions.setUserMfaActive, (state, action) => ({
    ...state,
    userMfaActive: action.payload ?? initialState.userMfaActive,
  }))
  .handleAction(authActions.setUST, (state, action) => ({ ...state, ust: action.payload ?? initialState.ust }))
  .handleAction(authActions.setRT, (state, action) => ({ ...state, rt: action.payload ?? '' }))
  .handleAction(authActions.setJWT, (state, action) => ({ ...state, jwt: action.payload }))
  .handleAction(authActions.setLoginFlowContext, (state, action) => ({
    ...state,
    loginFlowContext: action.payload,
  }))
  .handleAction(authActions.setLoginFactorsRequired, (state, action) => ({
    ...state,
    factorsRequired: action.payload ?? [],
  }))
  .handleAction(authActions.setDelegatedWalletInfo, (state, action) => ({
    ...state,
    delegatedWalletInfo: action.payload,
  }))
  .handleAction(authActions.setUserKeys, (state, action) => ({ ...state, userKeys: action.payload }))
  .handleAction(authActions.setLoginType, (state, action) => ({ ...state, loginType: action.payload }))
  .handleAction(authActions.setUserConsentTypes, (state, action) => ({ ...state, userConsent: action.payload }))
  .handleAction(authActions.setIsNewUser, (state, action) => ({ ...state, isNewUser: action.payload }))
  .handleAction(authActions.initAuthState, state => ({
    ...initialState,
    customAuthorizationToken: state.customAuthorizationToken, // Keep custom Auth
  }))
  .handleAction(authActions.setChainId, (state, action) => ({
    ...state,
    chainId: action.payload,
  }))
  .handleAction(authActions.setFactorId, (state, action) => ({ ...state, factorId: action.payload }))
  .handleAction(authActions.setAttemptId, (state, action) => ({ ...state, attemptId: action.payload }))
  .handleAction(authActions.setSecurityOtp, (state, action) => ({ ...state, securityOtp: action.payload }))
  .handleAction(authActions.setIsDeviceRecognized, (state, action) => ({
    ...state,
    isDeviceRecognized: action.payload,
  }))
  .handleAction(authActions.setDeviceVerifyLink, (state, action) => ({
    ...state,
    deviceVerifyLink: action.payload,
  }))
  .handleAction(authActions.setMagicLinkLoginType, (state, action) => ({
    ...state,
    magicLinkLoginType: action.payload,
  }))
  .handleAction(authActions.setCustomAuthorizationToken, (state, action) => ({
    ...state,
    customAuthorizationToken: action.payload,
  }))
  .handleAction(authActions.setDeviceShare, (state, action) => ({
    ...state,
    deviceShare: action.payload,
  }))
  .handleAction(authActions.setOauthMfaContext, (state, action) => ({
    ...state,
    oauthMfaContext: action.payload,
  }));

const apiKey = getApiKey();

export const Auth = createPersistReducer(`auth:${MD5.digest(apiKey)}`, AuthReducer, {
  whitelist: ['userID', 'ust', 'userEmail', 'userPhoneNumber', 'chainId'] as (keyof AuthState)[],
  shouldPersist: !!apiKey,
});

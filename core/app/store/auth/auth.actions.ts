import { createAction } from 'typesafe-actions';
import * as actionTypes from './auth.actionTypes';
import { DelegatedWalletInfo } from '../../types/delegated-wallet-types';
import { LoginMethodType } from '../../constants/flags';
import { MfaFactors } from '~/app/services/authentication/mfa-types';
import { UserConsentTypes } from '~/app/services/authentication/get-user-info';
import { ChainId, MagicLinkLoginType, OauthMfaContext, UserKeys } from './auth.reducer';

export const initAuthState = createAction(actionTypes.INIT_AUTH_STATE)();
export const setUserID = createAction(actionTypes.SET_USER_ID, (id?: string | null) => id)();
export const setClientID = createAction(actionTypes.SET_CLIENT_ID, (id?: string | null) => id)();
export const setUserEmail = createAction(actionTypes.SET_USER_EMAIL, (email?: string | null) => email)();
export const setUserPhoneNumber = createAction(actionTypes.SET_USER_PHONE_NUMBER, (email?: string | null) => email)();
export const setUserMfaActive = createAction(actionTypes.SET_USER_MFA_ACTIVE, (mfa: boolean) => mfa)();
export const setUserConsentTypes = createAction(
  actionTypes.SET_USER_CONSENT_TYPES,
  (consents?: UserConsentTypes) => consents,
)();
export const setLoginFlowContext = createAction(
  actionTypes.SET_LOGIN_FLOW_CONTEXT,
  (loginFlowContext: string) => loginFlowContext,
)();
export const setSecurityOtp = createAction(actionTypes.SET_SECURITY_OTP, (securityOtp: string) => securityOtp)();
export const setIsDeviceRecognized = createAction(
  actionTypes.SET_IS_DEVICE_RECOGNIZED,
  (isDeviceRecognized: boolean) => isDeviceRecognized,
)();
export const setDeviceVerifyLink = createAction(
  actionTypes.SET_DEVICE_VERIFY_LINK,
  (deviceVerifyLink: string) => deviceVerifyLink,
)();

export const setLoginFactorsRequired = createAction(
  actionTypes.SET_LOGIN_FACTORS_REQUIRED,
  (factors?: MfaFactors) => factors,
)();
export const setMagicLinkLoginType = createAction(
  actionTypes.SET_MAGIC_LINK_LOGIN_TYPE,
  (magicLinkLoginType: MagicLinkLoginType) => magicLinkLoginType,
)();
export const setUST = createAction(actionTypes.SET_UST, (ust?: string | null) => ust)();
export const setRT = createAction(actionTypes.SET_RT, (rt?: string | null) => rt)();
export const setJWT = createAction(actionTypes.SET_JWT, (jwt?: string | null) => jwt)();
export const setDelegatedWalletInfo = createAction(
  actionTypes.SET_DELEGATED_WALLET_INFO,
  (delegatedWalletInfo: DelegatedWalletInfo) => delegatedWalletInfo,
)();

export const setUserKeys = createAction(actionTypes.SET_USER_KEYS, (userKeys: UserKeys) => userKeys)();
export const setLoginType = createAction(actionTypes.SET_LOGIN_TYPE, (type?: LoginMethodType) => type)();
export const setIsNewUser = createAction(actionTypes.SET_IS_NEW_USER, (isNewUser: boolean | undefined) => isNewUser)();
export const setChainId = createAction(actionTypes.SET_CHAIN_ID, (chainId?: ChainId) => chainId)();
export const setFactorId = createAction(actionTypes.SET_FACTOR_ID, (factorId: string | undefined) => factorId)();
export const setAttemptId = createAction(actionTypes.SET_ATTEMPT_ID, (attemptId: string | undefined) => attemptId)();

export const setCustomAuthorizationToken = createAction(
  actionTypes.SET_CUSTOM_AUTHORIZATION_JWT,
  (jwt: string | undefined) => jwt,
)();

export const setDeviceShare = createAction(
  actionTypes.SET_DEVICE_SHARE,
  (deviceShare: string | undefined) => deviceShare,
)();

export const setOauthMfaContext = createAction(
  actionTypes.SET_OAUTH_MFA_CONTEXT,
  (oauthMfaContext: OauthMfaContext | null) => oauthMfaContext,
)();

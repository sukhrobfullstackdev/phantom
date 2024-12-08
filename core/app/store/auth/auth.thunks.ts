import { JsonRpcRequestPayload } from 'magic-sdk';
import { isUndefined } from '~/app/libs/lodash-utils';
import {
  ControlFlowErrorCode,
  createControlFlowError,
  createServiceError,
  isControlFlowError,
  isSDKError,
  isServiceError,
  resolveErrorCode,
  sdkErrorFactories,
} from '~/app/libs/exceptions';
import { AuthenticationService } from '~/app/services/authentication';
import { Web3Service } from '~/app/services/web3';
import { DelegatedWalletInfo } from '~/app/types/delegated-wallet-types';
import { ThunkActionWrapper, ThunkDispatchWrapper } from '../types';
import { globalCache } from '~/shared/libs/cache';
import { getNetworkName, getWalletExtensionOptions, getWalletType, isETHWalletType } from '~/app/libs/network';
import { WalletType } from '~/app/constants/flags';
import { createBridge } from '~/app/libs/ledger';
import { SessionService } from '~/app/services/session';
import { IS_STATIC_DEPLOYMENT } from '~/shared/constants/env';
import { poller } from '~/shared/libs/poller';
import { getPayloadData, getPayloadEventEmitter, rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { FlowService } from '~/app/services/flow';
import { FlowAddress, HederaAccounts } from '~/app/constants/ledger-support';
import { createRandomString } from '~/app/libs/crypto';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

// Actions & Thunks
import { UserThunks } from '../user/user.thunks';
import { SystemThunks } from '../system/system.thunks';
import { setSystemClockOffset, WalletSecretManagementInfo } from '../system/system.actions';
import {
  initAuthState,
  setClientID,
  setCustomAuthorizationToken,
  setDelegatedWalletInfo,
  setDeviceShare,
  setDeviceVerifyLink,
  setIsDeviceRecognized,
  setIsNewUser,
  setLoginFlowContext,
  setLoginType,
  setMagicLinkLoginType,
  setRT,
  setSecurityOtp,
  setUserConsentTypes,
  setUserEmail,
  setUserID,
  setUserKeys,
  setUserMfaActive,
  setUserPhoneNumber,
  setUST,
} from './auth.actions';
import { MultiBlockchainService } from '~/app/services/multi-blockchain';
import { USER_INFO_CACHE_CLEAR_REGEX } from '~/app/services/authentication/get-user-info';
import { retry } from '~/app/libs/retry';
import { ETH_ACCOUNTS, ETH_COINBASE } from '~/app/constants/eth-rpc-methods';
import { setActiveAuthWallet, setProfilePictureUrl, setUsedChainIds } from '../user/user.actions';
import { MagicLinkLoginType, UserKeys } from './auth.reducer';
import { data } from '~/app/services/web-storage/data-api';
import { DeviceVerificationService } from '~/features/device-verification/service';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { getUserKeysFromUserInfo } from '~/app/libs/get-user-keys-from-user-info';
import { DkmsService } from '~/app/services/dkms';
import { RELAYER_USER_INFO_CACHE } from '~/shared/constants/storage';

/**
 * Authenticate a user via the "magic link" flow.
 */
function loginWithMagicLink(
  email: string,
  redirectURI: string | undefined,
  payload: JsonRpcRequestPayload,
): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      dispatch(initAuthState());
      dispatch(setUserEmail(email));
      dispatch(setMagicLinkLoginType(redirectURI ? MagicLinkLoginType.Redirect : MagicLinkLoginType.OriginalContext));

      // Generate a unique request ID for this login, this is used to
      // authenticate the client between requests (CSRF protection).
      const requestOriginMessage = createRandomString(128);
      const { jwt } = getPayloadData(payload);

      // Send and process the magic link. If the following steps resolve, the
      // UST should be available in state and session cookies set.
      await dispatch(AuthThunks.sendMagicLink(requestOriginMessage, redirectURI, payload, jwt));
      await dispatch(AuthThunks.waitForDeviceVerified());
      await dispatch(AuthThunks.waitForMagicLinkClicked(requestOriginMessage, email, jwt));
      await dispatch(AuthThunks.persistSessionCookies(requestOriginMessage));

      // Get and save authenticated user information.
      await dispatch(AuthThunks.populateUserCredentials());
    } catch (e) {
      globalCache.clear(ETH_ACCOUNTS, ETH_COINBASE);
      if (isSDKError(e) || isControlFlowError(e)) throw e;
      if (isServiceError(e)) throw e.getControlFlowError();
      throw sdkErrorFactories.client.userDeniedAccountAccess();
    }
  };
}

/**
 * Authenticate a user via a `magic_credential`, which is a DID token that signs
 * a secret attachment. This is used to hydrate the user's KMS session after
 * magic link logins with a redirect URI.
 */
function loginWithCredential(magicCredential: string, jwt?: string): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      dispatch(initAuthState());

      const { auth_user_id, auth_user_session_token, refresh_token, email, rom } = (
        await AuthenticationService.redirectLogin(magicCredential, jwt)
      ).data;

      dispatch(setUserEmail(email));
      dispatch(setUserID(auth_user_id));
      dispatch(setUST(auth_user_session_token));
      dispatch(setRT(refresh_token));

      await dispatch(AuthThunks.persistSessionCookies(rom));

      // Get and save authenticated user information.
      await dispatch(AuthThunks.populateUserCredentials());
    } catch (e) {
      globalCache.clear(ETH_ACCOUNTS, ETH_COINBASE);
      if (isSDKError(e) || isControlFlowError(e)) throw e;
      if (isServiceError(e)) throw e.getControlFlowError();
      throw sdkErrorFactories.client.userDeniedAccountAccess();
    }
  };
}

/**
 * Hydrate the currently logged-in user. In the event that no valid UST or
 * userID is currently cached, this action is a no-op.
 */
function hydrateActiveUser(
  config: {
    from?: 'storage' | 'cookies';
    rt?: string;
    jwt?: string;
    allowStorage?: boolean;
    readStorage?: boolean;
  } = {},
): ThunkActionWrapper<Promise<boolean>> {
  return async (dispatch, getState) => {
    const { from, rt, jwt, allowStorage, readStorage } = config;
    const hydrateFromStorage = from === 'storage' || isUndefined(from);
    const hydrateFromCookies = from === 'cookies' || isUndefined(from);

    const { userID, ust } = getState().Auth;

    /* Iframe Local Storage */
    if (hydrateFromStorage && userID && ust) {
      try {
        await dispatch(AuthThunks.populateUserCredentials({ readStorage }));
        return true;
      } catch (e) {
        getLogger().warn('Warning with hydrateActiveUser: could not authenticate via storage', buildMessageContext(e));
      } // if we fail to hydrate from storage, try cookie refresh
    }

    /* Session Hydration using First-party Cookies */
    if (hydrateFromCookies && !IS_STATIC_DEPLOYMENT) {
      try {
        const { auth_user_id, auth_user_session_token, email, phone_number } = (await SessionService.refresh()).data;
        dispatch(setUserID(auth_user_id));
        dispatch(setUST(auth_user_session_token));
        dispatch(setUserEmail(email));
        dispatch(setUserPhoneNumber(phone_number));

        await dispatch(AuthThunks.populateUserCredentials({ readStorage, allowStorage }));
        return true;
      } catch (e) {
        getLogger().warn('Warning with hydrateActiveUser: could not authenticate via cookie', buildMessageContext(e));
      } // if we fail to hydrate from cookies, try dpop refresh
    }

    /* Session Hydration using Refresh token stored inside the first-party */
    if (rt && jwt) {
      try {
        const { auth_user_id, auth_user_session_token, refresh_token, email, phone_number } = (
          await AuthenticationService.getUstWithRt(rt, jwt)
        ).data;

        dispatch(setUserID(auth_user_id));
        dispatch(setUST(auth_user_session_token));
        dispatch(setRT(refresh_token));
        dispatch(setUserEmail(email));
        dispatch(setUserPhoneNumber(phone_number));
        await dispatch(AuthThunks.populateUserCredentials());
        return true;
      } catch (e) {
        getLogger().warn(
          'Warning with hydrateActiveUser: could not authenticate via refresh token',
          buildMessageContext(e),
        );
      } // if dpop fails, then logout and restart login flow
    }

    await dispatch(AuthThunks.logout({ shouldCallLogoutApi: false }));
    globalCache.clear(ETH_ACCOUNTS, ETH_COINBASE);
    return false;
  };
}

/**
 * POST `logout` event to Fortmatic API and reset the Auth Redux state store.
 */
function logout({ shouldCallLogoutApi } = { shouldCallLogoutApi: true }): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    globalCache.clear(ETH_ACCOUNTS, ETH_COINBASE);
    globalCache.clearByRegex(USER_INFO_CACHE_CLEAR_REGEX);
    if (shouldCallLogoutApi) {
      dispatch(setCustomAuthorizationToken(undefined)); // reset custom Auth only for real logout
      await AuthenticationService.logout(getState().Auth.userID).catch(() => {});
    }
    dispatch(initAuthState());
    dispatch(setProfilePictureUrl(undefined));
    dispatch(setActiveAuthWallet(undefined));
  };
}

/**
 * Begins the passwordless authentication flow by sending a magic link email for
 * the associated P2P lockbox.
 */
function sendMagicLink(
  requestOriginMessage: string,
  redirectURI: string | undefined,
  payload: JsonRpcRequestPayload,
  jwt?: string,
): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      const { userEmail } = getState().Auth;

      /**
       * UserVoice is a partner with a unique use-case requiring additional
       * flexibility to our custom theming options. Those options are provided
       * globally via a special, internal-only Magic SDK extension. We capture
       * those theme values here and pass them to the login service.
       */
      const uservoiceCustomTheme = getOptionsFromEndpoint(Endpoint.Client.SendLegacy).ext?.uservoiceThemeProvider;

      const { login_flow_context, utc_timestamp_ms, one_time_passcode } = (
        await AuthenticationService.loginStart(
          userEmail,
          requestOriginMessage,
          redirectURI,
          jwt,
          uservoiceCustomTheme,
          payload.params[0]?.overrides,
        )
      ).data;

      // lfc double caching
      dispatch(setLoginFlowContext(login_flow_context));
      await data.setItem('lfcCache', login_flow_context);
      dispatch(setSystemClockOffset(utc_timestamp_ms));
      dispatch(setSecurityOtp(one_time_passcode));
      dispatch(setIsDeviceRecognized(true));
      await dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: 'email-sent',
          params: [{ security_otp: one_time_passcode }],
        }),
      );
    } catch (err: any) {
      if (resolveErrorCode(err) === ControlFlowErrorCode.UserDeviceNotVerified) {
        dispatch(setDeviceVerifyLink(err.config?.location));
        dispatch(setIsDeviceRecognized(false));
      } else {
        dispatch(SystemThunks.emitJsonRpcEvent({ payload, event: 'email-not-deliverable' }));
        if (isServiceError(err)) throw err.getControlFlowError();
        else throw createServiceError(err).getControlFlowError();
      }
    }
  };
}

/**
 * Waits for the device to be verified
 */
function waitForDeviceVerified(): ThunkActionWrapper<Promise<void> | undefined> {
  return (dispatch, getState) => {
    // Bypass this poller step if device is verified
    if (getState().Auth.isDeviceRecognized) return;

    const { payload } = getState().UIThread;
    const originalPayloadID = payload?.id;
    const { deviceVerifyLink = '' } = getState().Auth;

    return poller<void>({
      delay: 5000,
      interval: 2000,
      expiresIn: 1000 * 60 * 20, // twenty minutes

      onInterval: async (resolve, reject) => {
        try {
          // Fail fast if the user cancelled login.
          if (originalPayloadID && getState().UIThread.payload?.id !== originalPayloadID) return reject();

          // if approved, kick this out of the auth flow and restart
          const { status } = (await DeviceVerificationService.deviceVerify(deviceVerifyLink)).data;
          if (status === 'approved') {
            reject(createControlFlowError(ControlFlowErrorCode.UserDeviceNotVerified));
            if (payload) {
              getPayloadEventEmitter(payload).emit('retry');
            }
          } else if (status === 'rejected') {
            rejectPayload(payload as any, sdkErrorFactories.client.userDeniedAccountAccess());
          }

          // for status === 'pending', we do nothing, just let it sit till expired
        } catch (e) {
          if (
            [
              ControlFlowErrorCode.OverMAUQuota,
              ControlFlowErrorCode.AnomalousRequestDetected,
              ControlFlowErrorCode.UnsupportedEthereumNetwork,
            ].includes(resolveErrorCode(e) as ControlFlowErrorCode)
          ) {
            reject(e);
          }
        }
      },

      onExpire: async (resolve, reject) => {
        reject(createControlFlowError(ControlFlowErrorCode.DeviceVerificationLinkExpired));
      },
    });
  };
}

/**
 * Waits for the magic link to be clicked and sets the UST, user ID, and
 * delegated wallet information into state upon login success.
 */
function waitForMagicLinkClicked(
  requestOriginMessage: string,
  originalEmail?: string,
  jwt?: string,
): ThunkActionWrapper<Promise<void>> {
  return (dispatch, getState) => {
    const originalPayloadID = getState().UIThread.payload?.id;

    return poller<void>({
      delay: 5000,
      interval: 2000,
      expiresIn: 1000 * 60 * 20, // twenty minutes

      onInterval: async (resolve, reject) => {
        try {
          // Fail fast if the user cancelled login.
          if (originalPayloadID && getState().UIThread.payload?.id !== originalPayloadID) return reject();

          // We've noticed a case where the stateful user email might be
          // overwritten in Redux if the developer forgets to await
          // `loginWithMagicLink`. Because the poller is an inherently async
          // action, we provide the email originally sent with the login request
          // and use that first, if defined.
          const userEmail = originalEmail ?? getState().Auth.userEmail;

          const { loginFlowContext: loginFlowContextFromRedux } = getState().Auth;
          const loginFlowContextCache = await data.getItem('lfcCache');
          const loginFlowContext = loginFlowContextFromRedux ?? loginFlowContextCache;

          const loginStatusRes = await AuthenticationService.loginStatus({
            email: userEmail,
            requestOriginMessage,
            jwt,
            loginFlowContext,
          });
          const isRedirectUri = getState().UIThread.payload?.params?.[0]?.redirectURI as string;

          if (isRedirectUri) {
            reject(createControlFlowError(ControlFlowErrorCode.LoginRedirectLoginComplete));
          } else {
            const { auth_user_id, auth_user_session_token, refresh_token } = loginStatusRes.data;

            dispatch(setUserID(auth_user_id));
            dispatch(setUST(auth_user_session_token));
            dispatch(setRT(refresh_token));

            resolve();
          }
        } catch (e) {
          if (
            [
              ControlFlowErrorCode.LoginWithMagicLinkExpired,
              ControlFlowErrorCode.LoginRedirectLoginComplete,
              ControlFlowErrorCode.OverMAUQuota,
              ControlFlowErrorCode.AnomalousRequestDetected,
              ControlFlowErrorCode.UnsupportedEthereumNetwork,
            ].includes(resolveErrorCode(e) as ControlFlowErrorCode)
          ) {
            reject(e);
          }
        }
      },

      onExpire: async (resolve, reject) => {
        reject(createControlFlowError(ControlFlowErrorCode.LoginWithMagicLinkExpired));
      },
    });
  };
}

/**
 * If the user being logged in is a "new user," this action will create a
 * delegated blockchain wallet, encrypt it with AWS KMS, then sync the encrypted
 * wallet with the Magic API.
 */
async function createAndSyncWallet(
  dispatch: ThunkDispatchWrapper,
  userID: string,
  walletType: string,
  walletSecretMangementInfo: WalletSecretManagementInfo,
  magicKmsInfo?: DelegatedWalletInfo,
  systemClockOffset = 0,
) {
  if (!!magicKmsInfo && !!userID) {
    try {
      let wallet: any;
      const walletCreationStartTimeStamp: number = Date.now();
      switch (walletType) {
        case WalletType.ETH: {
          wallet = Web3Service.createWallet();
          break;
        }
        case WalletType.FLOW: {
          const flowNetwork = getNetworkName();
          const flowAddress = flowNetwork === 'MAINNET' ? FlowAddress.mainnet : FlowAddress.testnet;
          const flowBridge = (await createBridge()).ledgerBridge;

          const createFlowWallet = async () => {
            return flowBridge.createWallet(
              (encodedPublicKey: any, network: string) => FlowService.flowSeedWallet(userID, encodedPublicKey, network),
              flowAddress,
              flowNetwork,
            );
          };

          wallet = await retry(createFlowWallet, 3, 0.1);

          // Master wallet balance check
          const balancePayload = {
            params: {
              address: `0x${flowAddress}`,
              network: flowNetwork,
            },
          };
          flowBridge.getBalance(balancePayload).then(flowBalance => {
            const flowBalanceMetadata = {
              balance: flowBalance,
              address: `0x${flowAddress}`,
              network: flowNetwork,
            };
            getLogger().info(`Flow ${flowNetwork} master account balance`, { flowBalanceMetadata });
          });

          break;
        }
        case WalletType.HEDERA: {
          const { network } = getWalletExtensionOptions();
          const hederaAccount = HederaAccounts[network];
          const hederaBridge = (await createBridge()).ledgerBridge;
          const hederaSign = (message: string) => MultiBlockchainService.hederaSignMessage(userID, message);

          wallet = await hederaBridge.createWallet(hederaSign, hederaAccount);

          const hederaGetBalancePayload = {
            params: {
              account: hederaAccount,
              hederaSign,
            },
          };

          hederaBridge.getBalance(hederaGetBalancePayload).then(balance => {
            const hederaBalanceLogMetadata = {
              balance,
              address: hederaAccount.accountId,
              blockChainNetwork: network,
            };
            getLogger().info(`Hedera ${network} master account balance`, { hederaBalanceLogMetadata });
          });

          break;
        }
        default:
          wallet = await (await createBridge()).ledgerBridge.createWallet();
      }

      const userKeys = await DkmsService.encryptAndSyncWallet(
        walletSecretMangementInfo,
        wallet,
        magicKmsInfo,
        userID,
        walletType,
        systemClockOffset,
      );

      const walletCreationTime = {
        startTimeStamp: walletCreationStartTimeStamp,
        endTimeStamp: Date.now(),
        span: (Date.now() - walletCreationStartTimeStamp) / 1000,
        walletType,
      };
      trackAction(AnalyticsActionType.NewWalletCreated, {
        walletType,
      });
      getLogger().info(`Wallet creation time: `, { walletCreationTime });
      await dispatch(setDeviceShare(userKeys.deviceShare));
      return userKeys;
    } catch (e) {
      dispatch(AuthThunks.logout());
      throw sdkErrorFactories.web3.failedWalletCreation();
    }
  }
  return {
    authUserId: userID,
    externalWalletId: undefined,
    walletId: undefined,
    publicAddress: undefined,
    encryptedPrivateAddress: undefined,
    encryptedMagicPrivateAddressShare: undefined,
    encryptedClientPrivateAddressShare: undefined,
    encryptedSeedPhrase: undefined,
    encryptedMagicSeedPhraseShare: undefined,
    encryptedClientSeedPhraseShare: undefined,
  };
}

/**
 * Once the UST and user ID is available (indicating the user is authenticated),
 * dispatching this action will retrieve user metadata and set AWS credentials.
 */
function populateUserCredentials({
  allowStorage = false,
}: {
  allowStorage?: boolean;
  readStorage?: boolean;
} = {}): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    /**
     * Populates user info into Redux state.
     */
    const populateUserInfo = async (walletType: string) => {
      const userIdentityInfo = (await AuthenticationService.getUserInfo(getState().Auth.userID, walletType)).data;
      // store result in storage temporarily for later use in the flow
      if (allowStorage) {
        data.setItem(
          RELAYER_USER_INFO_CACHE,
          JSON.stringify({
            data: userIdentityInfo,
            walletType,
          }),
        );
      }

      // PLEASE USE ONLY SYNCHRONOUS ACTIONS BELOW THIS LINE!
      if (userIdentityInfo.used_chain_ids) {
        // Note: the response will only store used chain ids for MC users
        dispatch(setUsedChainIds(userIdentityInfo.used_chain_ids));
      }

      dispatch(setDelegatedWalletInfo(userIdentityInfo.delegated_wallet_info));
      dispatch(setUserKeys(getUserKeysFromUserInfo(userIdentityInfo)));
      dispatch(setUserConsentTypes(userIdentityInfo.consent));
      dispatch(setSystemClockOffset(userIdentityInfo.utc_timestamp_ms));
      dispatch(setLoginType(userIdentityInfo.login.type));
      dispatch(setClientID(userIdentityInfo.client_id));
      dispatch(setUserMfaActive(userIdentityInfo.auth_user_mfa_active));
    };

    /**
     * Populates user info into Redux state, opens connection with AWS, and
     * creates/syncs new delegated wallet if required.
     */
    const populateUserInfoAndCreateWalletIfNecessary = async (walletType: string) => {
      await populateUserInfo(walletType);
      const { userID, delegatedWalletInfo, userKeys } = getState().Auth;
      const { walletSecretMangementInfo, systemClockOffset } = getState().System;
      if (walletType === WalletType.ETH) {
        dispatch(setIsNewUser(delegatedWalletInfo?.should_create_delegated_wallet));
      }
      if (delegatedWalletInfo?.should_create_delegated_wallet) {
        const newUserKeys = await AuthThunks.createAndSyncWallet(
          dispatch,
          userID,
          walletType,
          walletSecretMangementInfo,
          delegatedWalletInfo,
          systemClockOffset,
        );
        return newUserKeys;
      }
      return userKeys;
    };

    let userWalletKeys: UserKeys;

    /**
     * DH: For non-evm chains we manage an ADDITIONAL wallet in addition to an evm wallet.
     * This is implemented this way because the eth wallet and the second wallet
     * clobber eachother in redux.
     */
    userWalletKeys = await populateUserInfoAndCreateWalletIfNecessary(WalletType.ETH);
    if (!isETHWalletType()) {
      userWalletKeys = await populateUserInfoAndCreateWalletIfNecessary(getWalletType());
    }

    // Re-populate user info after wallet(s) is/are created and synced.
    if (getState().Auth.delegatedWalletInfo?.should_create_delegated_wallet) {
      dispatch(setUserKeys(userWalletKeys));
      if (getState().Auth.delegatedWalletInfo) {
        dispatch(
          setDelegatedWalletInfo({
            ...(getState().Auth.delegatedWalletInfo as DelegatedWalletInfo),
            should_create_delegated_wallet: false,
          }),
        );
      }
    }
  };
}

/**
 * Persist session cookies for the login request associated to the given
 * `requestOriginMessage`. In non-Magic & static deployments, this action is
 * noop.
 */
function persistSessionCookies(requestOriginMessage: string): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    if (!IS_STATIC_DEPLOYMENT) {
      const { userID } = getState().Auth;

      // We want to fail silently & gracefully if users are being served from a
      // static environment (such as non-Magic deployments).
      await SessionService.persist(userID, requestOriginMessage).catch(() => {});
    }
  };
}

function processWebAuthnLoginSession(
  auth_user_id: string,
  auth_user_session_token: string,
  payload: any,
  token_lifespan: any,
): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      dispatch(setUserID(auth_user_id));
      dispatch(setUST(auth_user_session_token));
      await dispatch(AuthThunks.populateUserCredentials());

      const token = await dispatch(UserThunks.createDIDTokenForUser(token_lifespan));
      await resolvePayload(payload, token);
    } catch (e) {
      await sdkErrorFactories.client.webAuthnRegistrationFailed().sdkReject(payload);
    }
  };
}

function hydrateUserSessionFromRedirectConfirm(
  tempLoginToken?: string,
  flow_context?: string,
  env: 'testnet' | 'mainnet' = 'testnet',
): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch(initAuthState());
    const res = await AuthenticationService.redirectConfirm(tempLoginToken, flow_context, env);
    dispatch(setUserID(res.data.auth_user_id));
    dispatch(setUserEmail(res.data.email));
    dispatch(setUST(res.data.ephemeral_auth_user_session_token));
    await dispatch(AuthThunks.populateUserCredentials());
  };
}

/**
 * Export module to stub local function stub for testing purpose
 */
export const AuthThunks = {
  sendMagicLink,
  loginWithMagicLink,
  loginWithCredential,
  hydrateActiveUser,
  populateUserCredentials,
  waitForDeviceVerified,
  waitForMagicLinkClicked,
  createAndSyncWallet,
  logout,
  persistSessionCookies,
  processWebAuthnLoginSession,
  hydrateUserSessionFromRedirectConfirm,
};

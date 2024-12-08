import { RpcMiddleware } from '~/app/rpc/types';
import { store } from '~/app/store';
import { getPayloadData, handleHydrateUser, rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { UserThunks } from '~/app/store/user/user.thunks';
import { DEFAULT_TOKEN_LIFESPAN } from '~/app/rpc/routes/magic-method-routes';
import { setRT, setUserEmail, setUserID, setUST } from '~/app/store/auth/auth.actions';
import { loginWithEmailOtpStore } from './store';
import {
  setEmailOtpShowUI,
  setEmailOTPWhitelabelROM,
  setLoginWithEmailOtpPayload,
  setOtpEmail,
  setOtpEmailShowDeviceCheckUI,
} from './store/email-otp.actions';
import { EmailOTPWhiteLabelState, sendEmailOtpWhiteLabel, verifyEmailOtp } from './email-otp-whitelabel.controller';
import { createRandomString } from '~/app/libs/crypto';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { ControlFlowErrorCode, resolveErrorCode, sdkErrorFactories } from '~/app/libs/exceptions';
import {
  DeviceVerificationEventEmit,
  DeviceVerificationEventOnReceived,
  LoginWithEmailOTPConfiguration,
  LoginWithEmailOTPEventEmit,
} from '@magic-sdk/types';
import { retry } from '~/app/libs/retry';

type loginWithEmailOtpParams = [LoginWithEmailOTPConfiguration & { rom: string }];
type loginWithEmailOtpMiddleware = RpcMiddleware<loginWithEmailOtpParams>;

export const marshalEmailOtpParams: loginWithEmailOtpMiddleware = async (ctx, next) => {
  await loginWithEmailOtpStore.ready;
  const showUI = ctx.payload.params?.[0].showUI ?? true;
  const deviceCheckUI = ctx.payload.params?.[0].deviceCheckUI ?? true;
  loginWithEmailOtpStore.dispatch(setOtpEmail(ctx.payload.params?.[0].email ?? ''));
  loginWithEmailOtpStore.dispatch(setEmailOtpShowUI(showUI));
  loginWithEmailOtpStore.dispatch(setOtpEmailShowDeviceCheckUI(deviceCheckUI));
  loginWithEmailOtpStore.dispatch(setLoginWithEmailOtpPayload(ctx.payload));

  // Disallow deviceCheckUI is false when showUI is true
  if (!deviceCheckUI && showUI) {
    return rejectPayload(
      ctx.payload,
      sdkErrorFactories.rpc.invalidParamsError('You may only set "deviceCheckUI" to be false when "showUI" is false'),
    );
  }
  next();
};

export const ifUserLoggedInThenResolve: loginWithEmailOtpMiddleware = async (ctx, next) => {
  const { payload, dispatch } = ctx;
  const { jwt, rt } = getPayloadData(payload);
  const hydrated = await handleHydrateUser({ rt, jwt });
  const { Auth } = store.getState();
  const { userEmail } = Auth;
  const email = payload.params?.[0].email.trim();

  const isLoggedIn = hydrated && !!Auth.ust;

  if (isLoggedIn) {
    if (userEmail === email) {
      try {
        const token = await dispatch(UserThunks.createDIDTokenForUser(DEFAULT_TOKEN_LIFESPAN));
        return resolvePayload(payload, token);
      } catch {
        // User is not logged in....so we logem out and continue
      }
    }
    await dispatch(AuthThunks.logout({ shouldCallLogoutApi: false }));
  }
  next();
};

export const applyWhitelabel: loginWithEmailOtpMiddleware = async (ctx, next) => {
  await loginWithEmailOtpStore.ready;
  const { payload } = ctx;
  const { email } = loginWithEmailOtpStore.getState();
  const showUI = payload.params?.[0].showUI ?? true;
  const deviceCheckUI = payload.params?.[0].deviceCheckUI ?? true;
  const emailOtpWhitelabelRom = createRandomString(128);

  loginWithEmailOtpStore.dispatch(setEmailOTPWhitelabelROM(emailOtpWhitelabelRom));

  if (showUI) {
    next();
    return;
  }

  /**
   * showUI false
   * Add emailOTP event listeners
   */
  // Cancel events
  RpcIntermediaryEventService.on(LoginWithEmailOTPEventEmit.Cancel, payload, async () => {
    store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, error: sdkErrorFactories.magic.requestCancelled() }));
    return;
  });

  // Verify Email OTP
  RpcIntermediaryEventService.on(LoginWithEmailOTPEventEmit.VerifyEmailOtp, payload, async (otc: string) => {
    const wasVerifySuccessful = await verifyEmailOtp(email, emailOtpWhitelabelRom, payload, otc);
    if (!wasVerifySuccessful) {
      return;
    }
    const { userID, ust, rt } = store.getState().Auth;
    await completeLogin(emailOtpWhitelabelRom, userID, ust, rt);
    const token = await store.dispatch(UserThunks.createDIDTokenForUser(DEFAULT_TOKEN_LIFESPAN));
    await resolvePayload(payload, token);
    return RpcIntermediaryEventService.remove(payload);
  });

  // Whitelabel Device Check
  if (!deviceCheckUI) {
    RpcIntermediaryEventService.on(DeviceVerificationEventEmit.Retry, payload, async () => {
      try {
        await sendEmailOtpWhiteLabel();
      } catch (e) {
        if (resolveErrorCode(e) === ControlFlowErrorCode.DeviceVerificationLinkExpired) {
          store.dispatch(
            SystemThunks.emitJsonRpcEvent({
              payload,
              event: DeviceVerificationEventOnReceived.DeviceVerificationLinkExpired,
            }),
          );
        }
      }
    });
  }

  // Send Email OTP
  const emailOTPWhitelabelState = await sendEmailOtpWhiteLabel();

  switch (emailOTPWhitelabelState) {
    case EmailOTPWhiteLabelState.Error:
      store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, error: sdkErrorFactories.rpc.internalError() }));
      return;
    case EmailOTPWhiteLabelState.NeedsDeviceApprovalUI:
      next();
      break;
    case EmailOTPWhiteLabelState.EmailOTPDone:
    case EmailOTPWhiteLabelState.NeedsDeviceApproval:
    default:
      break;
  }
};

export const completeLogin = async (
  rom: string,
  auth_user_id: string,
  auth_user_session_token: string,
  refreshToken?: string,
) => {
  const { email } = loginWithEmailOtpStore.getState();

  if (!rom) {
    return Promise.reject(new Error('Cannot resolve login without rom'));
  }

  store.dispatch(setUserID(auth_user_id));
  store.dispatch(setUST(auth_user_session_token));
  store.dispatch(setRT(refreshToken));
  store.dispatch(setUserEmail(email));
  await retry(() => store.dispatch(AuthThunks.persistSessionCookies(rom)), 3, 2);
  await store.dispatch(AuthThunks.populateUserCredentials());
};

export const resolveRpcWithDID = async () => {
  const { payload } = store.getState().UIThread;
  if (!payload) {
    return Promise.reject(new Error('No payload on UI thread'));
  }

  const token = await store.dispatch(UserThunks.createDIDTokenForUser(DEFAULT_TOKEN_LIFESPAN));
  await resolvePayload(payload, token);
};

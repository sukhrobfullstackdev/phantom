import { getPayloadData, rejectPayload } from '~/app/rpc/utils';
import { store } from '~/app/store';
import { ControlFlowErrorCode, isServiceError, resolveErrorCode, sdkErrorFactories } from '~/app/libs/exceptions';
import {
  setDeviceVerifyLink,
  setIsDeviceRecognized,
  setLoginFlowContext,
  setRT,
  setUserID,
  setUST,
} from '~/app/store/auth/auth.actions';
import { EmailOtpService } from './services/email-otp';
import { isCorrectVerificationCodeError, isLoginWithEmailOtpErrorCode } from './services/email-otp/email-otp';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { DeviceVerificationEventOnReceived, JsonRpcRequestPayload, LoginWithEmailOTPEventOnReceived } from 'magic-sdk';
import { data } from '~/app/services/web-storage/data-api';
import { loginWithEmailOtpStore } from '~/features/email-otp/store';
import { verifyDeviceWhitelabel } from '~/features/device-verification/store/device-verification.thunks';
import { VERIFICATION_CODE_EXPIRED } from './services/email-otp/errorCodes';

export enum EmailOTPWhiteLabelState {
  EmailOTPDone,
  NeedsDeviceApprovalUI,
  NeedsDeviceApproval,
  Error,
}

export async function sendEmailOtpWhiteLabel(): Promise<EmailOTPWhiteLabelState> {
  const { deviceCheckUI, emailOTPWhitelabelROM, email, payload } = loginWithEmailOtpStore.getState();
  const jwt = payload ? getPayloadData(payload)?.jwt : undefined;
  const overrides = payload ? payload.params?.[0]?.overrides : undefined;

  if (!emailOTPWhitelabelROM || !payload) {
    return EmailOTPWhiteLabelState.Error;
  }
  try {
    const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
    const version = LAUNCH_DARKLY_FEATURE_FLAGS['is-email-otp-v2-enabled'] ? 'v2' : 'v1';

    const { login_flow_context } = (
      await EmailOtpService.loginWithEmailOtpStart(email, emailOTPWhitelabelROM, version, jwt, overrides)
    ).data;
    // double caching
    await data.setItem('lfcCache', login_flow_context);
    await store.dispatch(setLoginFlowContext(login_flow_context));
    if (login_flow_context) {
      store.dispatch(SystemThunks.emitJsonRpcEvent({ payload, event: LoginWithEmailOTPEventOnReceived.EmailOTPSent }));
    }
    return EmailOTPWhiteLabelState.EmailOTPDone;
  } catch (e: any) {
    // Device needs verification
    if (resolveErrorCode(e) === ControlFlowErrorCode.UserDeviceNotVerified) {
      store.dispatch(setDeviceVerifyLink(e.config.location));
      store.dispatch(setIsDeviceRecognized(false));
      if (!deviceCheckUI) {
        await startDeviceVerificationWhiteLabel(email, emailOTPWhitelabelROM, payload);
        return EmailOTPWhiteLabelState.NeedsDeviceApproval;
      }
      // skip rest of the middleware to directly invoke device Verification UI
      return EmailOTPWhiteLabelState.NeedsDeviceApprovalUI;
    }
    if (isServiceError(e) && !isLoginWithEmailOtpErrorCode(e.code)) {
      // If any error occur in start endpoint, terminates whitelabel call and return the error.
      store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, error: e.getControlFlowError().getSDKError() }));
    }
  }
  return EmailOTPWhiteLabelState.Error;
}

/**
 * deviceCheck whitelabel
 */
function startDeviceVerificationWhiteLabel(email: string, rom: string, payload: JsonRpcRequestPayload) {
  store.dispatch(
    SystemThunks.emitJsonRpcEvent({
      payload,
      event: DeviceVerificationEventOnReceived.DeviceNeedsApproval,
    }),
  );
  try {
    store.dispatch(verifyDeviceWhitelabel(email, rom, payload));
    store.dispatch(
      SystemThunks.emitJsonRpcEvent({
        payload,
        event: DeviceVerificationEventOnReceived.DeviceVerificationEmailSent,
      }),
    );
  } catch (e) {
    if (resolveErrorCode(e) === ControlFlowErrorCode.DeviceVerificationLinkExpired) {
      store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: DeviceVerificationEventOnReceived.DeviceVerificationLinkExpired,
        }),
      );
    } else if (isServiceError(e) && !isLoginWithEmailOtpErrorCode(e.code)) {
      // If any error occur in start endpoint, terminates whitelabel call and return the error.
      store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, error: e.getControlFlowError().getSDKError() }));
    }
  }
}

export async function verifyEmailOtp(email: string, rom: string, payload: JsonRpcRequestPayload, otc: string) {
  if (!rom) {
    return false;
  }

  const { loginFlowContext: loginFlowContextFromRedux } = store.getState().Auth;
  const jwt = payload ? getPayloadData(payload)?.jwt : undefined;

  const loginFlowContextCache = await data.getItem('lfcCache');
  const loginFlowContext = loginFlowContextFromRedux ?? loginFlowContextCache;

  try {
    const { auth_user_id, auth_user_session_token, refresh_token, login_flow_context, factors_required } = (
      await EmailOtpService.loginWithEmailOtpVerify({
        email,
        rom,
        otc,
        jwt,
        loginFlowContext,
      })
    ).data;

    if (auth_user_id) {
      store.dispatch(setUserID(auth_user_id));
      store.dispatch(setUST(auth_user_session_token));
      store.dispatch(setRT(refresh_token));
      return true;
    }
    // To do at a later time: Add MFA Support. These two lines below are for MFA.
    // store.dispatch(setLoginFlowContext(login_flow_context));
    // store.dispatch(setLoginFactorsRequired(factors_required));

    rejectPayload(payload, sdkErrorFactories.magic.unsupportedMFA());
    return false;
  } catch (e: any) {
    if (e.code === VERIFICATION_CODE_EXPIRED) {
      store.dispatch(
        SystemThunks.emitJsonRpcEvent({ payload, event: LoginWithEmailOTPEventOnReceived.ExpiredEmailOtp }),
      );
      return false;
    }

    if (isCorrectVerificationCodeError(e.code)) {
      // if invalid code, send invalid
      store.dispatch(
        SystemThunks.emitJsonRpcEvent({ payload, event: LoginWithEmailOTPEventOnReceived.InvalidEmailOtp }),
      );
      return false;
    }

    // Otherwise, throw the error and terminate the channel.
    store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, error: e.getControlFlowError().getSDKError() }));
  }
  return false;
}

import { useState } from 'react';
import { ControlFlowErrorCode, isServiceError, resolveErrorCode } from '~/app/libs/exceptions';
import { getPayloadData } from '~/app/rpc/utils';
import { store } from '~/app/store';
import {
  setCustomAuthorizationToken,
  setDeviceVerifyLink,
  setIsDeviceRecognized,
  setJWT,
  setLoginFactorsRequired,
  setLoginFlowContext,
} from '~/app/store/auth/auth.actions';
import { isLoginWithEmailOtpErrorCode } from '../services/email-otp/email-otp';
import { EmailOtpService } from '../services/email-otp';
import { createJwtWithIframeKP } from '~/app/libs/webcrypto/dpop-utils';
import { retry } from '~/app/libs/retry';

export type SuccessLoginData = {
  auth_user_id: string;
  auth_user_session_token: string;
  refresh_token: string;
};

export const useEmailOtp = (email: string, rom: string) => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState<SuccessLoginData>();
  const [codeExpiration, setCodeExpiration] = useState(0);
  const [loginFlowContextFromState, setLoginFlowContextFromState] = useState('');

  const verifyEmailOtp = async (otc: string) => {
    if (!rom) {
      return false;
    }

    // optional dpop header jwt
    const { payload } = store.getState().UIThread;
    const { loginFlowContext: loginFlowContextFromRedux } = store.getState().Auth;
    const jwt = payload ? getPayloadData(payload)?.jwt : store.getState().Auth.jwt ?? undefined;

    try {
      setIsLoading(true);
      setError('');

      // Login Flow context in redux might be lost
      const loginFlowContext = loginFlowContextFromRedux ?? loginFlowContextFromState;

      const { auth_user_id, auth_user_session_token, refresh_token, login_flow_context, factors_required } = (
        await EmailOtpService.loginWithEmailOtpVerify({
          email,
          rom,
          otc,
          jwt,
          loginFlowContext,
        })
      ).data;

      setLoginFlowContextFromState(login_flow_context);
      store.dispatch(setLoginFlowContext(login_flow_context));
      store.dispatch(setLoginFactorsRequired(factors_required));
      store.dispatch(setIsDeviceRecognized(true));

      if (auth_user_id) {
        setLoginData({
          auth_user_id,
          auth_user_session_token,
          refresh_token,
        });
      }

      return true;
    } catch (e: any) {
      if (isServiceError(e) && !isLoginWithEmailOtpErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const sendEmailOtp = async () => {
    if (!rom) {
      return false;
    }

    const { payload } = store.getState().UIThread;
    const overrides = payload ? payload.params?.[0]?.overrides : undefined;

    const jwt = payload ? getPayloadData(payload)?.jwt : await createJwtWithIframeKP();
    store.dispatch(setJWT(jwt));

    try {
      setError(null);
      setIsLoading(true);

      const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
      const version = LAUNCH_DARKLY_FEATURE_FLAGS['is-email-otp-v2-enabled'] ? 'v2' : 'v1';

      const res = await EmailOtpService.loginWithEmailOtpStart(email, rom, version, jwt, overrides);
      const { utc_retrygate_ms, login_flow_context } = res.data;
      setLoginFlowContextFromState(login_flow_context);
      store.dispatch(setLoginFlowContext(login_flow_context));
      store.dispatch(setIsDeviceRecognized(true));
      setCodeExpiration(Math.abs(new Date(utc_retrygate_ms).getTime() - new Date().getTime()));

      return true;
    } catch (e: any) {
      if (resolveErrorCode(e) === ControlFlowErrorCode.UserDeviceNotVerified) {
        store.dispatch(setDeviceVerifyLink(e.config.location));
        store.dispatch(setIsDeviceRecognized(false));
      } else if (isServiceError(e) && !isLoginWithEmailOtpErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
      store.dispatch(setJWT(null));
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    sendEmailOtp,
    verifyEmailOtp,
    codeExpiration,
    error,
    isLoading,
    loginData,
  };
};

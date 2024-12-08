import { useState } from 'react';
import { ControlFlowErrorCode, isServiceError, resolveErrorCode } from '~/app/libs/exceptions';
import { getPayloadData } from '~/app/rpc/utils';
import { store } from '~/app/store';
import { setDeviceVerifyLink, setIsDeviceRecognized, setLoginFlowContext } from '~/app/store/auth/auth.actions';
import { SmsService } from '~/features/login-with-sms/services/sms';
import { LOGIN_THROTTLED } from '../services/sms/errorCodes';
import { isLoginWithSmsErrorCode } from '../services/sms/sms';
import { smsLoginStore } from '../store';
import { setRetryGateTime, setSmsExpiryTime } from '../store/login-with-sms.actions';
import { smsCreateDID, smsResolvePayloadWithDID } from '../store/login-with-sms.thunks';
import { RECAPTCHA_KEY } from '~/app/constants/env';
import { getLogger } from '~/app/libs/datadog';

export const useSms = (phoneNumber: string, rom: string) => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtcVerified, setIsOtcVerified] = useState(false);
  const [isFactorsRequired, setIsFactorsRequired] = useState(false);
  const [authUserId, setAuthUserId] = useState('');
  const [userSessionToken, setUserSessionToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const initiateDIDActions = async () => {
    if (!authUserId) {
      getLogger().error('Auth user ID is missing');
    }

    const token = await smsLoginStore.dispatch(smsCreateDID(authUserId, userSessionToken, refreshToken));
    smsLoginStore.dispatch(smsResolvePayloadWithDID(token));
  };

  const verifySms = async (otc: string) => {
    const { loginFlowContext } = store.getState().Auth;

    if (!phoneNumber || !rom || !loginFlowContext) {
      return false;
    }

    // optional dpop header jwt
    const { payload } = store.getState().UIThread;
    const jwt = payload ? getPayloadData(payload)?.jwt : undefined;

    try {
      setIsLoading(true);
      setError('');

      const { auth_user_id, auth_user_session_token, refresh_token, login_flow_context, factors_required } = (
        await SmsService.loginWithSmsVerify({
          phoneNumber,
          rom,
          otc,
          jwt,
          loginFlowContext,
        })
      ).data;
      await store.dispatch(setLoginFlowContext(login_flow_context));
      setAuthUserId(auth_user_id);
      setUserSessionToken(auth_user_session_token);
      setRefreshToken(refresh_token);
      setIsFactorsRequired(!!factors_required);
      setIsOtcVerified(true);

      return true;
    } catch (e) {
      const errorCode = e?.code;
      if (isServiceError(e) && !isLoginWithSmsErrorCode(errorCode)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const sendSmsOtc = async () => {
    if (!phoneNumber || !rom) {
      return false;
    }

    const { grecaptcha } = window as any;

    const googleReCaptchaToken = await grecaptcha.execute(RECAPTCHA_KEY, { action: 'submit' });

    const { payload } = store.getState().UIThread;
    const jwt = payload ? getPayloadData(payload)?.jwt : undefined;

    try {
      setError('');
      setIsLoading(true);
      const { utc_retrygate_ms, login_flow_context } = (
        await SmsService.loginWithSmsStart(phoneNumber, rom, googleReCaptchaToken, jwt)
      ).data;
      store.dispatch(setIsDeviceRecognized(true));
      await store.dispatch(setLoginFlowContext(login_flow_context));
      smsLoginStore.dispatch(setSmsExpiryTime(Math.abs(new Date(utc_retrygate_ms).getTime() - new Date().getTime())));

      return true;
    } catch (e: any) {
      if (resolveErrorCode(e) === ControlFlowErrorCode.UserDeviceNotVerified) {
        store.dispatch(setDeviceVerifyLink(e.config.location));
        store.dispatch(setIsDeviceRecognized(false));
      } else if (isServiceError(e) && !isLoginWithSmsErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      if (e.code === LOGIN_THROTTLED) {
        smsLoginStore.dispatch(setRetryGateTime(parseInt(e.message.replace(/\D/g, ''), 10) * 1000));
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    sendSmsOtc,
    verifySms,
    initiateDIDActions,
    isFactorsRequired,
    isOtcVerified,
    error,
    isLoading,
  };
};

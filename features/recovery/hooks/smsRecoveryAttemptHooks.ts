import { useState } from 'react';
import { isServiceError } from '~/app/libs/exceptions';
import { store } from '~/app/store';
import { RecoveryService } from '~/features/recovery/services/recovery';
import { LOGIN_THROTTLED } from '~/features/login-with-sms/services/sms/errorCodes';
import { isLoginWithSmsErrorCode } from '~/features/login-with-sms/services/sms/sms';
import { setRT, setUserEmail, setUserID, setUST } from '~/app/store/auth/auth.actions';
import { smsLoginStore } from '~/features/login-with-sms/store';
import { setRetryGateTime } from '~/features/login-with-sms/store/login-with-sms.actions';
import { setPrimaryFactorCredential } from '~/features/recency-check/store/recency.actions';
import { recencyStore } from '~/features/recency-check/store';

export const useSmsRecoveryAttempt = (email: string, factor_id: string) => {
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneVerifiedSuccessful, setIsPhoneVerifiedSuccessful] = useState(false);

  const sendSmsOtc = async () => {
    if (!email) {
      return false;
    }
    try {
      setError('');
      setIsLoading(true);

      const { attempt_id } = (await RecoveryService.recoveryFactorAttemptChallenge(factor_id)).data;

      setAttemptId(attempt_id);

      return true;
    } catch (e) {
      if (isServiceError(e) && !isLoginWithSmsErrorCode(e.code)) {
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

  const verifySms = async (otc: string) => {
    if (!email) {
      return false;
    }
    try {
      setIsLoading(true);
      setError('');

      const { auth_user_id, auth_user_session_token, refresh_token, credential } = (
        await RecoveryService.recoveryFactorAttemptVerify(attemptId || (await RecoveryService.recoveryFactorAttemptChallenge(factor_id)).data.attempt_id, otc)
      ).data;

      store.dispatch(setUserID(auth_user_id));
      store.dispatch(setUST(auth_user_session_token));
      store.dispatch(setRT(refresh_token));
      store.dispatch(setUserEmail(email));

      // set Primary Factor Credential
      recencyStore.dispatch(setPrimaryFactorCredential(credential));

      setIsPhoneVerifiedSuccessful(true);
      return true;
    } catch (e) {
      if (isServiceError(e) && !isLoginWithSmsErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
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
    isPhoneVerifiedSuccessful,
    error,
    isLoading,
  };
};

import { useState } from 'react';
import { isServiceError } from '~/app/libs/exceptions';
import { RecencyCheckService } from '~/features/recency-check/services';
import { isLoginWithSmsErrorCode } from '~/features/login-with-sms/services/sms/sms';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { isRecoveryErrorCode } from '~/features/recovery/services/recovery/setupRecoveryService';
import { LOGIN_THROTTLED } from '~/features/login-with-sms/services/sms/errorCodes';
import { smsLoginStore } from '~/features/login-with-sms/store';
import { setRetryGateTime } from '~/features/login-with-sms/store/login-with-sms.actions';
import { setPrimaryFactorCredential } from '~/features/recency-check/store/recency.actions';
import { recencyStore } from '~/features/recency-check/store';

export const verifyPrimaryFactorHooks = () => {
  const [error, setError] = useState<string>('');
  const [attemptId, setAttemptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailAddedOrEditedSuccessful, setIsEmailAddedOrEditedSuccessful] = useState(false);
  const userID = useSelector(coreState => coreState.Auth.userID);
  const userEmail = useSelector(coreState => coreState.Auth.userEmail);

  const sendEmailOtp = async () => {
    if (!userEmail) {
      return false;
    }

    try {
      setError('');
      setIsLoading(true);

      const { id } = (
        await RecencyCheckService.primaryFactorStart({
          auth_user_id: userID,
          value: userEmail,
          type: RecoveryMethodType.EmailAddress,
        })
      ).data;

      const { attempt_id } = (await RecencyCheckService.primaryFactorChallenge(id, userID)).data;

      setAttemptId(attempt_id);

      return true;
    } catch (e) {
      if (isServiceError(e) && !isRecoveryErrorCode(e.code)) {
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

  const verifyEmailOtp = async (otc: string) => {
    if (!userEmail) {
      return false;
    }

    try {
      setIsLoading(true);
      setError('');

      const { credential } = (await RecencyCheckService.primaryFactorVerify(attemptId, otc, userID)).data;
      recencyStore.dispatch(setPrimaryFactorCredential(credential));

      setIsEmailAddedOrEditedSuccessful(true);
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
    sendEmailOtp,
    verifyEmailOtp,
    isEmailAddedOrEditedSuccessful,
    error,
    isLoading,
  };
};

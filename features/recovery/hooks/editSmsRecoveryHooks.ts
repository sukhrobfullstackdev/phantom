import { useState } from 'react';
import { isServiceError } from '~/app/libs/exceptions';
import { RecoveryService } from '~/features/recovery/services/recovery';
import { isLoginWithSmsErrorCode } from '~/features/login-with-sms/services/sms/sms';
import { recoveryStore } from '../store';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { isRecoveryErrorCode } from '~/features/recovery/services/recovery/setupRecoveryService';
import { LOGIN_THROTTLED } from '~/features/login-with-sms/services/sms/errorCodes';
import { setRetryGateTime } from '~/features/login-with-sms/store/login-with-sms.actions';
import { smsLoginStore } from '~/features/login-with-sms/store';
import { setCurrentFactorId, setNewFactorId } from '~/features/recovery/store/recovery.actions';

export const useEditSmsRecovery = (phoneNumber?: string) => {
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneAddedOrEditedSuccessful, setIsPhoneAddedOrEditedSuccessful] = useState(false);
  const userId = useSelector(coreState => coreState.Auth.userID);
  const { currentFactorId: factorId } = recoveryStore.getState();

  const editRecoveryFactor = async phoneNumberFromInput => {
    if (!phoneNumberFromInput) {
      return false;
    }

    try {
      setError('');
      setIsLoading(true);

      const { id } = (
        await RecoveryService.patchRecoveryFactor(factorId, {
          auth_user_id: userId,
          value: phoneNumberFromInput,
          type: RecoveryMethodType.PhoneNumber,
          is_recovery_enabled: true,
        })
      ).data;

      // setting a new factor ID to be verified
      recoveryStore.dispatch(setNewFactorId(id));
      return true;
    } catch (e) {
      if (isServiceError(e) && !isRecoveryErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const sendSmsOtc = async () => {
    if (!phoneNumber) {
      return false;
    }

    try {
      setError('');
      setIsLoading(true);

      const { newFactorId } = recoveryStore.getState();

      const { attempt_id } = (await RecoveryService.setupRecoveryFactorChallenge(newFactorId, userId)).data;

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

  const verifySms = async (otc: string) => {
    if (!phoneNumber) {
      return false;
    }

    try {
      setIsLoading(true);
      setError('');

      await RecoveryService.setupRecoveryFactorVerify(attemptId, otc, userId);

      setIsPhoneAddedOrEditedSuccessful(true);

      return true;
    } catch (e) {
      if (isServiceError(e) && !isLoginWithSmsErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
    } finally {
      // silently handles remove the old one
      await RecoveryService.deleteRecoveryFactor(factorId, userId);

      // Move factorId
      const { newFactorId } = recoveryStore.getState();
      recoveryStore.dispatch(setCurrentFactorId(newFactorId));
      recoveryStore.dispatch(setNewFactorId(''));
      setIsLoading(false);
    }
    return false;
  };

  return {
    editRecoveryFactor,
    sendSmsOtc,
    verifySms,
    isPhoneAddedOrEditedSuccessful,
    error,
    isLoading,
  };
};

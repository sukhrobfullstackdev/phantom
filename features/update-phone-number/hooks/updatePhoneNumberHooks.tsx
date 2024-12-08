import { useState } from 'react';
import { isServiceError } from '~/app/libs/exceptions';
import { store } from '~/app/store';
import { isLoginWithSmsErrorCode } from '~/features/login-with-sms/services/sms/sms';
import { UpdatePhoneNumberService } from '../services';
import { updatePhoneNumberStore } from '../store';
import * as errorCodes from '../services/update-phone-number-error-codes';
import { smsLoginStore } from '~/features/login-with-sms/store';
import { setRetryGateTime } from '~/features/login-with-sms/store/login-with-sms.actions';
import { setAuthFactorId } from '~/features/update-phone-number/store/update-phone-number.actions';

function handleError(e, setError) {
  setError(e);
  if (isServiceError(e)) {
    e.getControlFlowError().setUIThreadError();
  }
}

export const useUpdatePhoneNumberService = () => {
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneVerifiedSuccessful, setIsPhoneVerifiedSuccessful] = useState(false);

  const startAuthUserFactor = async () => {
    try {
      setError('');
      setIsLoading(true);
      const { userID } = store.getState().Auth;
      const phoneNumber = updatePhoneNumberStore.getState().parsedPhoneNumber;
      const { id } = (
        await UpdatePhoneNumberService.createAuthUserFactorForNewEmail(userID, 'phone_number', phoneNumber as string)
      ).data;
      if (!id) {
        return false;
      }
      updatePhoneNumberStore.dispatch(setAuthFactorId(id));
      return true;
    } catch (e) {
      if (isServiceError(e) && !(isLoginWithSmsErrorCode(e.code) || isUpdatePhoneNumberErrorCode(e.code))) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const sendSmsOtc = async () => {
    try {
      setError('');
      setIsLoading(true);
      const { userID } = store.getState().Auth;
      const { authFactorId } = updatePhoneNumberStore.getState();

      const { attempt_id } = (await UpdatePhoneNumberService.phoneUpdateChallenge(userID, authFactorId)).data;
      if (!attempt_id) {
        return false;
      }
      setAttemptId(attempt_id);
      return true;
    } catch (e: any) {
      if (isServiceError(e) && !isLoginWithSmsErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      if (e.code === errorCodes.MAX_TRIES_EXCEEDED) {
        smsLoginStore.dispatch(setRetryGateTime(parseInt(e.message.replace(/\D/g, ''), 10) * 1000));
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const verifySms = async (response: string) => {
    if (!response) {
      return false;
    }
    try {
      setIsLoading(true);
      setError('');
      const { userID } = store.getState().Auth;

      const resPhoneUpdateVerify = await UpdatePhoneNumberService.phoneUpdateVerify(userID, attemptId, response);
      if (!resPhoneUpdateVerify) {
        setIsPhoneVerifiedSuccessful(false);
        return false;
      }
      setIsPhoneVerifiedSuccessful(true);
      return true;
    } catch (e: any) {
      if (isServiceError(e) && !isUpdatePhoneNumberErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      if (e.message === errorCodes.MAX_TRIES_EXCEEDED) {
        smsLoginStore.dispatch(setRetryGateTime(parseInt(e.message.replace(/\D/g, ''), 10) * 1000));
      }
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    startAuthUserFactor,
    sendSmsOtc,
    verifySms,
    isPhoneVerifiedSuccessful,
    error,
    isLoading,
  };
};

export function isUpdatePhoneNumberErrorCode(code) {
  return errorCodes[code];
}

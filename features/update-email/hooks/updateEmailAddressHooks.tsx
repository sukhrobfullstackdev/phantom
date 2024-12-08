import { useState } from 'react';
import { isServiceError } from '~/app/libs/exceptions';
import { store } from '~/app/store';
import { UpdateEmailAddressService } from '../services';
import { updateEmailStore } from '../store';
import * as errorCodes from '../services/update-email-address-error-codes';
import { initUpdateEmailState, setUpdateEmailFactorId } from '~/features/update-email/store/update-email.actions';
import { setUserEmail } from '~/app/store/auth/auth.actions';
import { recencyStore } from '~/features/recency-check/store';

export const useUpdateEmailAddressHooks = () => {
  const [error, setError] = useState<string>('');
  const [attemptId, setAttemptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailAddressVerifiedSuccessful, setIsEmailAddressVerifiedSuccessful] = useState(false);

  const resetUI = () => {
    setError('');
    setIsLoading(true);
  };

  const createAuthUserFactorForNewEmail = async () => {
    try {
      resetUI();
      const { userID } = store.getState().Auth;
      const { updatedEmail } = updateEmailStore.getState();
      const { id } = (await UpdateEmailAddressService.createAuthUserFactorForNewEmail(userID, updatedEmail as string))
        .data;
      if (!id) {
        return false;
      }
      updateEmailStore.dispatch(setUpdateEmailFactorId(id));
      return true;
    } catch (e: any) {
      if (isServiceError(e) && !isUpdatePhoneNumberErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const sendEmailOtp = async () => {
    try {
      resetUI();
      const { userID } = store.getState().Auth;
      const { primaryFactorCredential: credential } = recencyStore.getState();
      const { updateEmailFactorId } = updateEmailStore.getState();

      const { attempt_id } = (
        await UpdateEmailAddressService.emailUpdateChallenge(userID, updateEmailFactorId, credential)
      ).data;

      setAttemptId(attempt_id);
      return true;
    } catch (e: any) {
      if (isServiceError(e) && !isUpdatePhoneNumberErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const verifyUpdateEmailOtp = async (response: string) => {
    const { updatedEmail } = updateEmailStore.getState();

    if (!response) {
      return false;
    }
    try {
      resetUI();
      const { userID } = store.getState().Auth;

      const resPhoneUpdateVerify = await UpdateEmailAddressService.emailUpdateVerify(userID, attemptId, response);
      if (!resPhoneUpdateVerify) {
        setIsEmailAddressVerifiedSuccessful(false);
        return false;
      }
      setIsEmailAddressVerifiedSuccessful(true);
      // Update store email
      store.dispatch(setUserEmail(updatedEmail));
      updateEmailStore.dispatch(initUpdateEmailState());
      return true;
    } catch (e: any) {
      if (isServiceError(e) && !isUpdatePhoneNumberErrorCode(e.code)) {
        e.getControlFlowError().setUIThreadError();
      }
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    createAuthUserFactorForNewEmail,
    sendEmailOtp,
    verifyUpdateEmailOtp,
    isEmailAddressVerifiedSuccessful,
    error,
    isLoading,
  };
};

export function isUpdatePhoneNumberErrorCode(code) {
  return errorCodes[code];
}

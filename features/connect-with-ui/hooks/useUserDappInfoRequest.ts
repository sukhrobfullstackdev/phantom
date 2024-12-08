import { useState } from 'react';
import { store } from '~/app/store';
import { saveDappInfoRequestEmail } from '../services/dapp-user-info-request';

export const useUserDappInfoRequest = () => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const userId = store.hooks.useSelector(state => state.Auth.userID);

  const logEmailUserDappInfoConsent = async (email: string) => {
    try {
      setIsLoading(true);
      setError('');

      await saveDappInfoRequestEmail(userId, email);
    } catch (e: any) {
      e.getControlFlowError().setUIThreadError();
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logEmailUserDappInfoConsent,
    error,
    isLoading,
  };
};

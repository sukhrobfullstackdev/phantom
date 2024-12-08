import { useState } from 'react';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { RecoveryService } from '~/features/recovery/services/recovery';
import { isServiceError } from '~/app/libs/exceptions';
import { isRecoveryErrorCode } from '~/features/recovery/services/recovery/setupRecoveryService';

export const useDeleteSmsRecovery = (factorId: string) => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneDeletedSuccessful, setIsPhoneDeletedSuccessful] = useState(false);
  const userId = useSelector(coreState => coreState.Auth.userID);

  const deleteSmsRecovery = async () => {
    if (!factorId) {
      return false;
    }

    try {
      setIsLoading(true);
      setError('');

      await RecoveryService.deleteRecoveryFactor(factorId, userId);
      setIsPhoneDeletedSuccessful(true);

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

  return {
    deleteSmsRecovery,
    isLoading,
    error,
    isPhoneDeletedSuccessful,
  };
};

import { useMemo } from 'react';
import { useSelector } from '~/app/ui/hooks/redux-hooks';

export const useFeatureFlags = () => {
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = useSelector(state => state.System);

  const isTransactionConfirmationEnabled = useMemo(
    () =>
      LAUNCH_DARKLY_FEATURE_FLAGS['is-confirm-action-flow-enabled'] &&
      CLIENT_FEATURE_FLAGS.is_transaction_confirmation_enabled,
    [LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS],
  );

  return {
    LAUNCH_DARKLY_FEATURE_FLAGS,
    CLIENT_FEATURE_FLAGS,
    isTransactionConfirmationEnabled,
  };
};

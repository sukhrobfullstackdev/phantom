import { useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { RecoveryService } from '~/features/recovery/services/recovery';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import { formatPhoneNumber } from '~/features/recovery/utils/utils';
import { recoveryStore } from '~/features/recovery/store';
import { setCurrentFactorId } from '~/features/recovery/store/recovery.actions';
import { RecoveryFactor } from '~/features/recovery/services/recovery/getRecoveryService';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

export const getSmsRecovery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const userID = useSelector(coreState => coreState.Auth.userID);
  const [isSmsRecoveryEnabled, setIsSmsRecoveryEnabled] = useState(false);
  const [phoneNumberForLogin, setPhoneNumberForLogin] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');

  useAsyncEffect(async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);

      const recoveryFactorList: [RecoveryFactor] = (await RecoveryService.getRecoveryFactor(userID)).data;

      const phoneNumberRecoveryFactor = recoveryFactorList.find(
        factor => factor.type === RecoveryMethodType.PhoneNumber && factor.is_active,
      );

      if (phoneNumberRecoveryFactor) {
        const phoneNumber = phoneNumberRecoveryFactor?.value;

        recoveryStore.dispatch(setCurrentFactorId(phoneNumberRecoveryFactor.id));
        setPhoneNumberForLogin(phoneNumber);

        setIsSmsRecoveryEnabled(true);
        setFormattedPhoneNumber(formatPhoneNumber(phoneNumber));
      }

      return false;
    } catch (e) {
      getLogger().warn('Warning with getSmsRecovery', buildMessageContext(e));
    } finally {
      setIsLoading(false);
    }
  }, [userID]);

  return {
    isRecoveryFactorLoading: isLoading,
    phoneNumberForLogin,
    formattedPhoneNumber,
    isSmsRecoveryEnabled,
  };
};

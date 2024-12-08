import React, { useEffect, useState } from 'react';
import { Icon, Spacer } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import { i18n } from '~/app/libs/i18n';
import { smsLoginStore } from '../../store';
import { useSms } from '../../hooks/smsHooks';
import styles from './verification-page.less';
import { LoginWithSmsPage } from '../partials/login-with-sms-page';
import { SmsVerificationForm } from '../sms-verification-form/sms-verification-form';
import { LOGIN_THROTTLED } from '../../services/sms/errorCodes';
import { SecurityLockoutPage } from '../security-lockout-page';
import { rejectLoginLockoutLifted } from '../../store/login-with-sms.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { SmsChatBubble } from '~/shared/svg/sms';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';
import { useSelector } from '~/app/ui/hooks/redux-hooks';

export const SmsVerificationPage = () => {
  const { navigateTo } = useControllerContext();
  const phoneNumber = smsLoginStore.hooks.useSelector(state => state.phoneNumber || '');
  const rom = smsLoginStore.hooks.useSelector(state => state.rom || '');
  const isDeviceRecognized = useSelector(state => state.Auth.isDeviceRecognized);

  const [isThrottled, setIsThrottled] = useState(false);
  const { verifySms, sendSmsOtc, initiateDIDActions, isFactorsRequired, isOtcVerified, error } = useSms(
    phoneNumber,
    rom,
  );

  useAsyncEffect(async () => {
    if (isOtcVerified) {
      setTimeout(() => (isFactorsRequired ? navigateTo('enforce-phone-mfa') : initiateDIDActions()), 1000);
    }
  }, [isOtcVerified]);

  useEffect(() => {
    if (isDeviceRecognized === false) {
      navigateTo('device-verification-pending');
    }
  }, [isDeviceRecognized]);

  const onLiftLockout = () => {
    smsLoginStore.dispatch(rejectLoginLockoutLifted());
  };

  useEffect(() => {
    if (error === LOGIN_THROTTLED) {
      setIsThrottled(true);
    }
  }, [error]);

  if (isThrottled) {
    return <SecurityLockoutPage onLiftLockout={onLiftLockout} />;
  }

  return (
    <LoginWithSmsPage className={styles.verificationPageWrapper}>
      <Icon type={SmsChatBubble} size={44} />
      <Spacer size={24} orientation="vertical" />
      <div className={styles.sentMessageTitle}>
        {i18n.login_sms.enter_verification_code.toMarkdown()} <strong>{phoneNumber}</strong>
      </div>
      <Spacer size={40} orientation="vertical" />
      {!isOtcVerified && (
        <SmsVerificationForm
          {...{
            verifySms,
            sendSmsOtc,
            error,
          }}
        />
      )}
      {isOtcVerified && <Icon aria-label={i18n.generic.success.toString()} type={SuccessCheckmark} />}
    </LoginWithSmsPage>
  );
};

import React, { useEffect, useState } from 'react';
import { Icon, Spacer } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import { i18n } from '~/app/libs/i18n';
import styles from './use-recovery-sms-verification-page.less';
import { LoginWithSmsPage } from '~/features/login-with-sms/components/partials/login-with-sms-page';
import { SmsVerificationForm } from '~/features/login-with-sms/components/sms-verification-form/sms-verification-form';
import { LOGIN_THROTTLED } from '~/features/login-with-sms/services/sms/errorCodes';
import { SecurityLockoutPage } from '~/features/login-with-sms/components/security-lockout-page';
import { rejectLoginLockoutLifted } from '~/features/login-with-sms/store/login-with-sms.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { recoveryStore } from '~/features/recovery/store';
import { SmsChatBubble } from '~/shared/svg/sms';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton, AppNameHeader } from '~/app/ui/components/widgets/modal-action-button';
import { useSmsRecoveryAttempt } from '~/features/recovery/hooks/smsRecoveryAttemptHooks';
import { NeedHelpTextLink } from '~/features/recovery/components/setup-recovery-sms-verification-page/need-help';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';

export const UseRecoverySmsVerificationPage = () => {
  const { navigateTo } = useControllerContext();

  const email = recoveryStore.hooks.useSelector(state => state.primaryFactorToRecover) ?? '';
  const phoneNumber = recoveryStore.hooks.useSelector(state => state.currentFactorValue) ?? '';
  const factorId = recoveryStore.hooks.useSelector(state => state.currentFactorId) ?? '';

  const [isOtcVerified, setIsOtcVerified] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const { verifySms, sendSmsOtc, isPhoneVerifiedSuccessful, error, isLoading } = useSmsRecoveryAttempt(email, factorId);
  useAsyncEffect(async () => {}, [isPhoneVerifiedSuccessful]);

  useAsyncEffect(async () => {
    if (isPhoneVerifiedSuccessful) {
      setIsOtcVerified(true);
      setTimeout(() => navigateTo('account-recovered'), 1000);
    }
  }, [isPhoneVerifiedSuccessful]);

  const onLiftLockout = () => {
    recoveryStore.dispatch(rejectLoginLockoutLifted());
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
    <>
      <ModalHeader rightAction={<CancelActionButton />} header={<AppNameHeader />} />
      <LoginWithSmsPage className={styles.useRecoverySmsVerificationPageWrapper}>
        <Spacer size={32} orientation="vertical" />
        <Icon type={SmsChatBubble} size={44} />
        <Spacer size={24} orientation="vertical" />
        <div className={styles.sentMessageTitle}>
          {i18n.login_sms.enter_verification_code.toMarkdown()}
          <br />
          <strong>{phoneNumber}</strong>
        </div>
        <Spacer size={40} orientation="vertical" />
        {!isOtcVerified && (
          <SmsVerificationForm
            {...{
              verifySms,
              sendSmsOtc,
              error,
              secondaryTextLink: <NeedHelpTextLink />,
            }}
          />
        )}
        {isOtcVerified && <Icon aria-label={i18n.generic.success.toString()} type={SuccessCheckmark} />}
      </LoginWithSmsPage>
    </>
  );
};

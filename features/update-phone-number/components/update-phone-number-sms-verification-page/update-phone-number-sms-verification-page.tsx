import React, { useEffect, useState } from 'react';
import { Icon, Spacer, Typography } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import styles from './update-phone-number-sms-verification-page.less';
import { LoginWithSmsPage } from '~/features/login-with-sms/components/partials/login-with-sms-page';
import { SmsVerificationForm } from '~/features/login-with-sms/components/sms-verification-form/sms-verification-form';
import { SecurityLockoutPage } from '~/features/login-with-sms/components/security-lockout-page';
import { rejectLoginLockoutLifted } from '~/features/login-with-sms/store/login-with-sms.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton, BackActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { useUpdatePhoneNumberService } from '../../hooks/updatePhoneNumberHooks';
import { updatePhoneNumberStore } from '../../store';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { resolvePayload } from '~/app/rpc/utils';
import { MAX_TRIES_EXCEEDED } from '../../services/update-phone-number-error-codes';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';

export const UpdatePhoneNumberSmsVerificationPage = ({ navBackRoute }) => {
  const { theme } = useTheme();
  const { navigateTo } = useControllerContext();
  const formattedPhoneNumber = updatePhoneNumberStore.hooks.useSelector(state => state.phoneNumber) ?? '';
  const parsedPhoneNumber = updatePhoneNumberStore.hooks.useSelector(state => state.parsedPhoneNumber || '');
  const selectedCountryCallingCode = updatePhoneNumberStore.hooks.useSelector(
    state => state.selectedCountryCallingCode || '',
  );

  const [isOtcVerified, setIsOtcVerified] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const { verifySms, sendSmsOtc, error, isPhoneVerifiedSuccessful } = useUpdatePhoneNumberService();
  const payload = useUIThreadPayload();

  useAsyncEffect(async () => {
    if (isPhoneVerifiedSuccessful && payload) {
      setIsOtcVerified(true);
      await resolvePayload(payload, parsedPhoneNumber);
    }
  }, [isPhoneVerifiedSuccessful]);

  const onLiftLockout = () => {
    updatePhoneNumberStore.dispatch(rejectLoginLockoutLifted());
  };

  useEffect(() => {
    if (error === MAX_TRIES_EXCEEDED) {
      setIsThrottled(true);
    }
  }, [error]);

  if (isThrottled) {
    return <SecurityLockoutPage onLiftLockout={onLiftLockout} />;
  }

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo(navBackRoute)} />}
        header={theme.appName}
        rightAction={<CancelActionButton />}
      />
      <LoginWithSmsPage className={styles.verificationPageWrapper}>
        <Spacer size={16} orientation="vertical" />
        <ThemeLogo height="54px" style={{ maxWidth: 'inherit' }} />
        <Spacer size={24} orientation="vertical" />
        <Typography.BodyMedium weight="400" className={styles.sentMessageTitle}>
          {i18n.update_phone_number.enter_otc.toString()}
        </Typography.BodyMedium>
        <Spacer size={4} orientation="vertical" />
        <Typography.BodyLarge>
          {' '}
          {selectedCountryCallingCode} {formattedPhoneNumber}{' '}
        </Typography.BodyLarge>
        <Spacer size={32} orientation="vertical" />
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
    </>
  );
};

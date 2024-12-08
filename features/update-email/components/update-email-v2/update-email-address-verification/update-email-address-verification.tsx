import React, { useEffect, useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { Icon, Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import styles from './update-email-address-verification.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { AppNameHeader, BackActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { EnvelopeWithOpenText, SuccessCheckmark, SuccessCheckmarkDarkmode } from '~/shared/svg/magic-connect';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { EmailOtpVerificationForm } from '~/features/email-otp/components/verification-page/email-otp-verification-form';
import { ModalPageContainer } from '~/features/email-otp/components/modal-page-container';
import { useUpdateEmailAddressHooks } from '~/features/update-email/hooks/updateEmailAddressHooks';
import { updateEmailStore } from '~/features/update-email/store';

export const UpdateEmailOtpVerificationPage = () => {
  const theme = useTheme();
  const { navigateTo } = useControllerContext();
  const { sendEmailOtp, verifyUpdateEmailOtp, error, isLoading } = useUpdateEmailAddressHooks();
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const updatedEmail = updateEmailStore.hooks.useSelector(state => state.updatedEmail) ?? '';

  const renderSuccessCheckmark = () => {
    return theme.theme.isDarkTheme ? SuccessCheckmarkDarkmode : SuccessCheckmark;
  };

  useAsyncEffect(async () => {
    if (isOtpVerified) {
      navigateTo('update-email-successful');
    }
  }, [isOtpVerified]);

  const onOtpVerified = () => {
    setIsOtpVerified(true);
  };

  useEffect(() => {
    sendEmailOtp();
  }, []);

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('update-email-input-address')} />}
        header={<AppNameHeader />}
      />
      <ModalPageContainer className={styles.verificationPageWrapper}>
        <Spacer size={32} orientation="vertical" />
        <Icon color={theme.theme.color.primary.base.toString()} type={EnvelopeWithOpenText} size={44} />
        <Spacer size={24} orientation="vertical" />
        <div className={styles.sentMessageTitle}>
          {i18n.login_sms.enter_verification_code.toMarkdown()} <strong>{updatedEmail}</strong>
        </div>
        <Spacer size={40} orientation="vertical" />
        {!isOtpVerified && (
          <EmailOtpVerificationForm
            {...{
              verifyEmailOtp: verifyUpdateEmailOtp,
              onOtpVerified,
              error,
            }}
          />
        )}
        {isOtpVerified && <Icon aria-label={i18n.generic.success.toString()} type={renderSuccessCheckmark()} />}
      </ModalPageContainer>
    </>
  );
};

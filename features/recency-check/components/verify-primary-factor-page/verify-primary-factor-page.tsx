import React, { useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { Icon, Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import styles from './verify-primary-factor-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { EnvelopeWithOpenText, SuccessCheckmark, SuccessCheckmarkDarkmode } from '~/shared/svg/magic-connect';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { EmailOtpVerificationForm } from '~/features/email-otp/components/verification-page/email-otp-verification-form';
import { ModalPageContainer } from '~/features/email-otp/components/modal-page-container';
import { verifyPrimaryFactorHooks } from '~/features/recency-check/hooks/verifyPrimaryFactorHooks';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { recencyStore } from '~/features/recency-check/store';

export const VerifyPrimaryFactorPage = () => {
  const theme = useTheme();
  const { navigateTo } = useControllerContext();
  const userEmail = useSelector(state => state.Auth.userEmail);
  const { sendEmailOtp, verifyEmailOtp, error, isLoading } = verifyPrimaryFactorHooks();
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const destination: string | undefined = recencyStore.hooks.useSelector(state => state.destinationAfterVerified);
  const needPrimaryFactorVerification: boolean = recencyStore.hooks.useSelector(
    state => state.needPrimaryFactorVerification,
  );

  const renderSuccessCheckmark = () => {
    return theme.theme.isDarkTheme ? SuccessCheckmarkDarkmode : SuccessCheckmark;
  };

  useAsyncEffect(async () => {
    // skip recency check if passed
    if ((!needPrimaryFactorVerification || isOtpVerified) && destination) {
      navigateTo(destination);
    } else {
      // Otherwise sending OTP to verify
      sendEmailOtp();
    }
  }, [isOtpVerified, needPrimaryFactorVerification, destination]);

  const onOtpVerified = () => {
    setIsOtpVerified(true);
  };

  return (
    <>
      <ModalHeader rightAction={<CancelActionButton />} />
      <ModalPageContainer className={styles.verificationPageWrapper}>
        {needPrimaryFactorVerification && (
          <>
            <Icon color={theme.theme.color.primary.base.toString()} type={EnvelopeWithOpenText} size={44} />
            <Spacer size={24} orientation="vertical" />
            <div className={styles.sentMessageTitle}>
              {i18n.login_sms.enter_verification_code.toMarkdown()} <strong>{userEmail}</strong>
            </div>
            <Spacer size={40} orientation="vertical" />
            {!isOtpVerified && (
              <EmailOtpVerificationForm
                {...{
                  verifyEmailOtp,
                  onOtpVerified,
                  error,
                }}
              />
            )}
            {isOtpVerified && <Icon aria-label={i18n.generic.success.toString()} type={renderSuccessCheckmark()} />}
          </>
        )}
      </ModalPageContainer>
    </>
  );
};

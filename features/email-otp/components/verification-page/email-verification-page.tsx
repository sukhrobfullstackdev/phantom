import React, { useEffect, useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { Icon, Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { SuccessLoginData, useEmailOtp } from '../../hooks/emailOtpHooks';
import styles from './verification-page.less';
import { ModalPageContainer } from '../modal-page-container';
import { EmailOtpVerificationForm } from './email-otp-verification-form/email-otp-verification-form';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { EnvelopeWithOpenText, SuccessCheckmark, SuccessCheckmarkDarkmode } from '~/shared/svg/magic-connect';
import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { getRouteForMcUserIfSignUpOrHasAuthWallets } from '~/features/connect-with-ui/utils/get-route-for-mc-user';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { tryResolvePublicAddress } from '~/features/connect-with-ui/connect-with-ui.controller';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { connectStore } from '~/features/connect-with-ui/store';
import { setLastSelectedLogin } from '~/features/connect-with-ui/store/connect.actions';
import { EmailWbr } from '~/app/ui/components/widgets/email-wbr';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { loginWithEmailOtpStore } from '~/features/email-otp/store';
import { VERIFICATION_CODE_EXPIRED } from '../../services/email-otp/errorCodes';

type EmailOtpVerificationPageProps = {
  rom: string;
  email: string;
  isSecondFactor: boolean;
  resolveLogin: (loginData: SuccessLoginData) => Promise<any>;
};

export const EmailVerificationPage = ({ rom, email, isSecondFactor, resolveLogin }: EmailOtpVerificationPageProps) => {
  const theme = useTheme();
  const payload = useUIThreadPayload();
  const { navigateTo } = useControllerContext();
  const { verifyEmailOtp, sendEmailOtp, error, isLoading, loginData } = useEmailOtp(email, rom);
  const isDeviceRecognized = useSelector(state => state.Auth.isDeviceRecognized);
  const showUI = loginWithEmailOtpStore.hooks.useSelector(state => state.showUI);
  const [isLoadingDID, setIsLoadingDID] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const renderSuccessCheckmark = () => {
    return theme.theme.isDarkTheme ? SuccessCheckmarkDarkmode : SuccessCheckmark;
  };

  // Only reached if new user or user has MA wallets
  const routeConnectUserAfterLogin = () => {
    connectStore.dispatch(setLastSelectedLogin('email-otp'));
    const route = getRouteForMcUserIfSignUpOrHasAuthWallets();
    if (route === 'resolve') {
      return tryResolvePublicAddress(payload);
    }
    navigateTo(route, eventData);
  };

  useAsyncEffect(async () => {
    if (isOtpVerified) {
      if (isSecondFactor) {
        navigateTo('enforce-email-otp-mfa');
      } else if (loginData) {
        setIsLoadingDID(true);
        await resolveLogin(loginData);
        setIsLoadingDID(false);
        if (isGlobalAppScope()) {
          routeConnectUserAfterLogin();
        }
      }
    }
  }, [isOtpVerified]);

  const onOtpVerified = () => {
    setIsOtpVerified(true);
  };

  useEffect(() => {
    // When deviceCheckUI is true in whitelabel EmailOTP, The UI will land on this page first then jump to device verification page
    // As the emailOTP has been sent in the middleware in whitelabel flow, we skip triggering emailOTP in the page
    if (showUI) {
      sendEmailOtp();
    }
  }, [showUI]);

  useEffect(() => {
    if (error === VERIFICATION_CODE_EXPIRED) {
      navigateTo('email-otp-expired');
    }
  }, [error]);

  useEffect(() => {
    if (isDeviceRecognized === false) {
      navigateTo('device-verification-pending');
    }
  }, [isDeviceRecognized]);

  return (
    <>
      <ModalHeader rightAction={!(isLoading || isLoadingDID) ? <CancelActionButton /> : null} />
      <ModalPageContainer className={styles.verificationPageWrapper}>
        {isDeviceRecognized ? (
          <>
            <Icon color={theme.theme.color.primary.base.toString()} type={EnvelopeWithOpenText} size={44} />
            <Spacer size={24} orientation="vertical" />

            <div className={styles.sentMessageTitle}>
              {i18n.login_sms.enter_verification_code.toMarkdown()}
              <br />
              <strong>
                <EmailWbr email={email} />
              </strong>
            </div>
            <Spacer size={40} orientation="vertical" />

            {isOtpVerified ? (
              <Icon aria-label={i18n.generic.success.toString()} type={renderSuccessCheckmark()} />
            ) : (
              <EmailOtpVerificationForm
                {...{
                  verifyEmailOtp,
                  onOtpVerified,
                  error,
                }}
              />
            )}
          </>
        ) : (
          <LoadingSpinner />
        )}
      </ModalPageContainer>
    </>
  );
};

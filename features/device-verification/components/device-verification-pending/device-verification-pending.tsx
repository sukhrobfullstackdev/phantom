import React, { useEffect } from 'react';
import { Flex, Icon, Linkable, Spacer } from '@magiclabs/ui';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { Edit } from '~/shared/svg/email-link';
import { WarningShieldLogo } from '~/shared/svg/account-recovery';
import styles from './device-verification-pending.less';
import { useDeviceVerification } from '~/features/device-verification/hooks/device-verification-hooks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { AuthFlow, DeviceVerificationProps } from '~/features/device-verification/_rpc/device-verification';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { loginWithEmailOtpStore } from '~/features/email-otp/store';
import { sendEmailOtpWhiteLabel } from '~/features/email-otp/email-otp-whitelabel.controller';

export const DeviceVerificationPending: React.FC<DeviceVerificationProps> = ({ authFactor, authFlow }) => {
  const { verifyDevice, stopDevicePoller, isDeviceVerified, isDeviceLinkExpired } = useDeviceVerification();
  const { navigateTo } = useControllerContext();
  const isDeviceRecognized = useSelector(state => state.Auth.isDeviceRecognized);
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRequestEditEmail());
  const { showUI: loginWithEmailOTPShowUI } = loginWithEmailOtpStore.hooks.useSelector(state => state);
  const { theme } = useTheme();

  useEffect(() => {
    // Fallback trigger
    if (isDeviceVerified && isDeviceRecognized) {
      switch (authFlow) {
        case AuthFlow.EmailOTP:
          if (loginWithEmailOTPShowUI) {
            navigateTo('login-with-email-otp');
          } else {
            // DeviceCheckUI true
            sendEmailOtpWhiteLabel();
          }
          break;
        case AuthFlow.MagicLink:
          navigateTo('login-check-email');
          break;
        case AuthFlow.SMS:
          navigateTo('login-with-sms');
          break;
      }
    }

    // start the poller, but excluding the magiclink,
    // as Magiclink got it's own poller that's designed for the pre-feature framework
    if (!isDeviceVerified && authFlow !== AuthFlow.MagicLink) {
      verifyDevice();
    }
    return () => stopDevicePoller();
  }, [authFlow, isDeviceRecognized, isDeviceVerified]);

  useEffect(() => {
    if (isDeviceLinkExpired) {
      navigateTo('device-verification-link-expired');
    }
  }, [isDeviceLinkExpired]);

  return (
    <Flex.Column horizontal="center">
      <Icon type={WarningShieldLogo} size={40} color={theme.hex.primary.base} />

      <Spacer size={24} orientation="vertical" />

      <h2 className={styles.title}>{i18n.verify_device.register_your_device.toMarkdown()}</h2>

      <Spacer size={8} orientation="vertical" />

      <Flex.Column horizontal="center" className="fontDescriptionSmall fontCentered">
        <span aria-hidden="true">{i18n.verify_device.device_registeration_link_sent_to.toMarkdown()}</span>
        <Spacer size={4} orientation="vertical" />
        <Flex.Row vertical="center">
          <b aria-hidden="true">{authFactor}</b>

          <Spacer size={5} />

          <Linkable>
            <button onClick={cancel} aria-label="Edit your email">
              <Flex.Item>
                <Icon type={Edit} color={theme.hex.primary.base} />
              </Flex.Item>
            </button>
          </Linkable>
        </Flex.Row>

        <Spacer size={32} orientation="vertical" />
        <span aria-hidden="true">{i18n.verify_device.device_one_time_approval.toMarkdown()}</span>
      </Flex.Column>
    </Flex.Column>
  );
};

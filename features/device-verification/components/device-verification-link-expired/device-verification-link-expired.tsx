import React, { useCallback, useEffect } from 'react';
import { CallToAction, Flex, Icon, Linkable, Spacer } from '@magiclabs/ui';
import { useCloseUIThread, useEmitUIThreadEvent } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { AlertIcon } from '~/shared/svg/auth';
import styles from './device-verification-link-expired.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { AuthFlow, DeviceVerificationProps } from '~/features/device-verification/_rpc/device-verification';

export const DeviceVerificationLinkExpired: React.FC<DeviceVerificationProps> = ({
  authFactor,
  authFlow,
}: DeviceVerificationProps) => {
  const retry = useEmitUIThreadEvent('retry');
  const close = useCloseUIThread(sdkErrorFactories.client.userDeniedAccountAccess());
  const { navigateTo } = useControllerContext();

  const resend = useCallback(() => {
    switch (authFlow) {
      case AuthFlow.EmailOTP:
        navigateTo('login-with-email-otp');
        break;
      case AuthFlow.MagicLink:
        retry();
        break;
      case AuthFlow.SMS:
        navigateTo('login-with-sms');
        break;
    }
  }, [authFlow]);

  useEffect(() => {
    trackAction(AnalyticsActionType.PendingModalUpdated, { factor: authFactor, status: 'expired' });
  }, [authFactor]);

  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center">
      <Icon type={AlertIcon} size={40} color={theme.hex.primary.base} />

      <Spacer size={24} orientation="vertical" />

      <h2>{i18n.verify_device.device_verification_link_expired.toMarkdown()}</h2>

      <Spacer size={8} orientation="vertical" />

      <div className="fontDescriptionSmall fontCentered">
        {i18n.verify_device.your_device_link_expired.toMarkdown()}
      </div>

      <Spacer size={40} orientation="vertical" />

      <CallToAction onPress={resend} className={styles.callToAction}>
        {i18n.verify_device.resend_email.toString()}
      </CallToAction>

      <Spacer size={16} orientation="vertical" />

      <Linkable>
        <button onClick={close}>
          <b>{i18n.verify_device.close.toString()}</b>
        </button>
      </Linkable>
    </Flex.Column>
  );
};

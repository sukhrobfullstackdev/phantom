import React, { useEffect } from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { useTheme } from '../../../../hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { ErrorIcon } from '~/shared/svg/magic-connect';
import styles from './auth-security-otp-expired.less';

export const AuthSecurityOtpExpired: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'failed' });
  }, []);

  return (
    <Flex.Column horizontal="center" aria-live="assertive" className={styles.AuthFailed}>
      <Icon type={ErrorIcon} size={50} />
      <Spacer size={24} orientation="vertical" />
      <h2 className="fontCentered">{i18n.login.security_code_expired.toMarkdown()}</h2>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescription fontDescriptionSmall fontCentered">
        {i18n.login.to_receive_a_new_code_please_return_to_app.toMarkdown({ appName: theme.appName })}
      </p>
      <Spacer size={16} orientation="vertical" />
      <p className="fontDescriptionSmall fontCentered" style={{ color: 'var(--ink70)' }}>
        {i18n.login.redirect_login_complete_content.toMarkdown()}
      </p>
    </Flex.Column>
  );
};

AuthSecurityOtpExpired.displayName = 'AuthSecurityOtpExpired';

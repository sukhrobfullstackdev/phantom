import React, { useEffect } from 'react';
import { Flex, Spacer, Icon } from '@magiclabs/ui';
import { useTheme } from '../../../../hooks/use-theme';
import { ThemeLogo } from '../../../widgets/theme-logo';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { i18n } from '~/app/libs/i18n';

import styles from './auth-success.less';
import { SuccessCheckmarkWithCircle } from '~/shared/svg/auth';

export const AuthSuccess: React.FC = () => {
  const { theme, isDefaultTheme } = useTheme();

  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'success' });
  }, []);

  return (
    <Flex.Column horizontal="center" className={styles.AuthSuccess} aria-live="assertive">
      {!isDefaultTheme('logoImage') ? (
        <>
          <ThemeLogo height={69} />
          <Spacer size={28} orientation="vertical" />
        </>
      ) : (
        <>
          <Icon type={SuccessCheckmarkWithCircle} />
          <Spacer size={28} orientation="vertical" />
        </>
      )}

      <h2 className="fontCentered">{i18n.login.login_complete.toMarkdown()}</h2>
      <Spacer size={4} orientation="vertical" />
      <p className="fontDescription fontCentered">{i18n.login.go_back_to_app.toMarkdown({ appName: theme.appName })}</p>
      <Spacer size={40} orientation="vertical" />
      <p className="fontDescriptionSmall fontCentered">{i18n.login.you_can_close_this_window.toMarkdown()}</p>
    </Flex.Column>
  );
};

AuthSuccess.displayName = 'AuthSuccess';

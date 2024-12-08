import React, { useEffect } from 'react';
import { Spacer, Icon, Flex } from '@magiclabs/ui';
import { useTheme } from '../../../../hooks/use-theme';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { i18n } from '~/app/libs/i18n';

import styles from './auth-link-broken.less';
import { AlertIcon } from '~/shared/svg/auth';

export const AuthLinkBroken: React.FC = () => {
  const { theme, isDefaultTheme } = useTheme();

  const label = isDefaultTheme('appName') ? (
    <>{i18n.login.request_new_link_generic.toMarkdown()}</>
  ) : (
    <>{i18n.login.request_new_link_app.toMarkdown({ appName: theme.appName })}</>
  );

  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'expired' });
  }, []);

  return (
    <Flex.Column horizontal="center" className={styles.AuthLinkBroken} aria-live="assertive">
      <Icon type={AlertIcon} />
      <Spacer size={28} orientation="vertical" />
      <h1>{i18n.login.magic_link_broken.toMarkdown()}</h1>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescription fontCentered">{label}</p>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescriptionSmall fontCentered">{i18n.login.you_can_close_this_window.toMarkdown()}</p>
    </Flex.Column>
  );
};

AuthLinkBroken.displayName = 'AuthLinkBroken';

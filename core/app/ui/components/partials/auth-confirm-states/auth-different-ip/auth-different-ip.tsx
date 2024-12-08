import React, { useEffect } from 'react';
import { Spacer, Icon, Flex } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { i18n } from '~/app/libs/i18n';

import styles from './auth-different-ip.less';
import { AlertIcon } from '~/shared/svg/auth';

export const AuthDifferentIp: React.FC = () => {
  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'invalid-ip' });
  }, []);

  return (
    <Flex.Column horizontal="center" className={styles.AuthDifferentIp} aria-live="assertive">
      <Icon type={AlertIcon} />
      <Spacer size={28} orientation="vertical" />
      <h1>{i18n.login.magic_link_sent_from_different_ip_header.toMarkdown()}</h1>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescription fontCentered">{i18n.login.magic_link_sent_from_different_ip.toMarkdown()}</p>
    </Flex.Column>
  );
};

AuthDifferentIp.displayName = 'AuthDifferentIp';

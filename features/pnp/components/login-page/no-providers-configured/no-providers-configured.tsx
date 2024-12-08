import { Flex, Icon, MonochromeIcons, Spacer } from '@magiclabs/ui';
import React from 'react';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';

import styles from './no-providers-configured.less';

export const NoProvidersConfigured: React.FC = () => {
  const { theme, isDefaultTheme } = useTheme();

  const instructionText = isDefaultTheme('appName') ? (
    <>{i18n.pnp.contact_app_for_help_generic.toString()}</>
  ) : (
    <>{i18n.pnp.contact_app_for_help.toString({ appName: theme.appName })}</>
  );

  return (
    <Flex.Column horizontal="center" className={styles.NoProvidersConfigured}>
      <Icon type={MonochromeIcons.Exclaim} color={theme.isLightTheme ? theme.hex.mid.base : theme.hex.mid.lighter} />
      <Spacer size={15} orientation="vertical" />
      <p className={styles.message}>{i18n.pnp.login_disabled.toString()}</p>
      <Spacer size={4} orientation="vertical" />
      <p className={styles.instruction}>{instructionText}</p>
    </Flex.Column>
  );
};
